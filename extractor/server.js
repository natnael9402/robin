/**
 * Kinet Extractor — auth-free yt-dlp extraction API for YouTube (and friends).
 *
 * Plain Node (no build step, no npm deps) so this folder can never break the
 * compiled /ol app. Runs next to the bgutil PO-token sidecar on the same
 * compose network; drop a Netscape cookies.txt at ./secrets/cookies/youtube.txt
 * for maximum trust (optional).
 *
 * Endpoints:
 *   GET  /health                     → { ok, uptime, ytDlp }
 *   POST /resolve  { url }           → trimmed yt-dlp metadata JSON
 *   POST /download { url, quality }  → streams the merged video file back
 *   POST /audio    { url }           → streams an mp3 back
 *
 * Speed: per-client short-circuit (first working client wins), in-process
 * pacing (single-flight + min gap — keeps the box's IP unflagged), 10-min
 * resolve cache, pure stream piping (no whole-file buffering).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const PORT = Number(process.env.PORT) || 4100;
const HOST = process.env.HOST || '0.0.0.0';
// Optional: set EXTRACTOR_TOKEN to require `x-extractor-token` header. Empty = open (as requested).
const TOKEN = (process.env.EXTRACTOR_TOKEN || '').trim();
const POT_URL = (process.env.POT_PROVIDER_URL || 'http://pot-provider:4416').trim();
const COOKIES = (process.env.YTDLP_COOKIES || '/run/secrets/cookies/youtube.txt').trim();
const MIN_INTERVAL_MS = Number(process.env.EXTRACTOR_MIN_INTERVAL_MS) || 6000;
const RESOLVE_TTL_MS = 10 * 60_000;
const RESOLVE_TIMEOUT_MS = 120_000;
const DOWNLOAD_TIMEOUT_MS = 15 * 60_000;
const AUDIO_TIMEOUT_MS = 6 * 60_000;
const TMP = process.env.EXTRACTOR_TMP || '/tmp/extractor';
const CLIENTS = ['android', 'tv_simply', 'web_embedded', 'default'];

fs.mkdirSync(TMP, { recursive: true });

// ── yt-dlp plumbing ────────────────────────────────────────

function baseArgs(client) {
  const args = [
    '--no-playlist',
    '--force-ipv4',
    '--socket-timeout', '30',
    '--extractor-args', `youtube:player_client=${client}`,
  ];
  try {
    if (COOKIES && fs.existsSync(COOKIES) && fs.statSync(COOKIES).size > 0) {
      args.push('--cookies', COOKIES);
    }
  } catch {}
  if (POT_URL) args.push('--extractor-args', `youtubepot-bgutilhttp:base_url=${POT_URL}`);
  args.push('--js-runtimes', 'node:/usr/local/bin/node');
  return args;
}

function runYtDlp(args, timeoutMs) {
  return new Promise((resolve, reject) => {
    execFile(
      '/usr/local/bin/yt-dlp',
      args,
      { timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 },
      (err, stdout, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve(stdout)),
    );
  });
}

// Single-flight + pacing: parallel bursts are what gets IPs bot-checked.
let queue = Promise.resolve();
let lastRun = 0;
function gated(fn) {
  const run = queue.then(async () => {
    const wait = lastRun + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    try {
      return await fn();
    } finally {
      lastRun = Date.now();
    }
  });
  queue = run.then(() => {}, () => {});
  return run;
}

// Per-client isolation: one bot-checked client must not poison the others.
async function perClient(buildArgs, timeoutMs) {
  let lastErr = null;
  for (const client of CLIENTS) {
    try {
      return await gated(() => runYtDlp(buildArgs(client), timeoutMs));
    } catch (err) {
      lastErr = err;
      const tail = String(err.message || '').trim().split('\n').pop();
      console.warn(`[extractor] client=${client} failed: ${tail}`);
    }
  }
  throw lastErr || new Error('all clients failed');
}

// ── Endpoint handlers ──────────────────────────────────────

const resolveCache = new Map(); // url → { at, meta }
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of resolveCache) if (now - v.at > RESOLVE_TTL_MS) resolveCache.delete(k);
}, 60_000).unref();

const TRIM_FORMATS = (f) => ({
  format_id: f.format_id,
  ext: f.ext,
  height: f.height,
  width: f.width,
  vcodec: f.vcodec,
  acodec: f.acodec,
  filesize: f.filesize,
  filesize_approx: f.filesize_approx,
  tbr: f.tbr,
  protocol: f.protocol,
});

async function handleResolve(body, res) {
  const url = String(body.url || '').trim();
  if (!/^https?:\/\//i.test(url)) return send(res, 400, { error: 'url must be http(s)' });

  const hit = resolveCache.get(url);
  if (hit && Date.now() - hit.at < RESOLVE_TTL_MS) return send(res, 200, hit.meta);

  const out = await perClient(
    (client) => ['-J', ...baseArgs(client), url],
    RESOLVE_TIMEOUT_MS,
  );
  const meta = JSON.parse(out);
  if (!meta) throw new Error('empty yt-dlp response');
  const trimmed = {
    id: meta.id,
    title: meta.title,
    description: (meta.description || '').slice(0, 500),
    duration: meta.duration,
    thumbnail: meta.thumbnail,
    uploader: meta.uploader,
    channel: meta.channel,
    webpage_url: meta.webpage_url,
    extractor: meta.extractor_key || meta.extractor,
    formats: Array.isArray(meta.formats) ? meta.formats.map(TRIM_FORMATS) : [],
  };
  resolveCache.set(url, { at: Date.now(), meta: trimmed });
  send(res, 200, trimmed);
}

const QUALITY_FORMAT = {
  '1080': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080][ext=mp4]/best[ext=mp4]/best',
  '720': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720][ext=mp4]/best[ext=mp4]/best',
  '480': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480][ext=mp4]/best[ext=mp4]/best',
  audio: 'ba/b',
};

async function handleDownload(body, res, audioOnly) {
  const url = String(body.url || '').trim();
  if (!/^https?:\/\//i.test(url)) return send(res, 400, { error: 'url must be http(s)' });
  const quality = String(body.quality || '720');
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const dir = fs.mkdtempSync(path.join(TMP, `${id}-`));
  const ext = audioOnly ? 'mp3' : 'mp4';
  const outPath = path.join(dir, `download.${ext}`);

  const args = (client) => {
    const a = [
      ...baseArgs(client),
      '-N', '8',
      '--retries', '5',
      '--fragment-retries', '10',
      '-o', outPath,
    ];
    if (audioOnly) {
      a.push('-f', 'ba/b', '-x', '--audio-format', 'mp3', '--audio-quality', '4');
    } else {
      a.push('-f', QUALITY_FORMAT[quality] || QUALITY_FORMAT['720'], '--merge-output-format', 'mp4');
    }
    a.push(url);
    return a;
  };

  try {
    await perClient(args, audioOnly ? AUDIO_TIMEOUT_MS : DOWNLOAD_TIMEOUT_MS);
    const produced = fs.existsSync(outPath)
      ? outPath
      : fs.readdirSync(dir).map((f) => path.join(dir, f)).find((f) => fs.statSync(f).isFile());
    if (!produced) throw new Error('download produced no file');

    const size = fs.statSync(produced).size;
    res.writeHead(200, {
      'Content-Type': audioOnly ? 'audio/mpeg' : 'video/mp4',
      'Content-Length': size,
      'Content-Disposition': `attachment; filename="download.${path.extname(produced).slice(1)}"`,
    });
    fs.createReadStream(produced).pipe(res);
    res.on('close', () => cleanup(dir));
  } catch (err) {
    cleanup(dir);
    throw err;
  }
}

function cleanup(dir) {
  fs.rm(dir, { recursive: true, force: true }, () => {});
}

// ── HTTP shell ─────────────────────────────────────────────

function send(res, code, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      return send(res, 200, { ok: true, uptime: process.uptime(), ytDlp: true });
    }
    if (req.method !== 'POST') return send(res, 404, { error: 'not found' });
    if (TOKEN && req.headers['x-extractor-token'] !== TOKEN) {
      return send(res, 401, { error: 'bad token' });
    }
    const body = await readBody(req);
    if (req.url === '/resolve') return await handleResolve(body, res);
    if (req.url === '/download') return await handleDownload(body, res, false);
    if (req.url === '/audio') return await handleDownload(body, res, true);
    return send(res, 404, { error: 'not found' });
  } catch (err) {
    console.error(`[extractor] ${req.method} ${req.url} → ${err.message}`);
    if (!res.headersSent) send(res, 502, { error: String(err.message || 'extraction failed').slice(0, 500) });
    else res.destroy();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[extractor] listening on ${HOST}:${PORT} (pot=${POT_URL || 'off'}, cookies=${COOKIES}, auth=${TOKEN ? 'on' : 'off'})`);
});
