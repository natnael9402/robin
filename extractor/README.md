# Kinet Extractor (German egress for YouTube)

Standalone yt-dlp extraction API. **Zero overlap with the Paxora stack** — the
`/ol` app, its compiled `dist`, and the main `docker-compose.yml` are
untouched. This stack runs its own two containers on port `4100`.

## Run it

```bash
cd robin
docker compose -f docker-compose.extractor.yml up -d --build
```

## Test it

```bash
curl http://localhost:4100/health
curl -X POST http://localhost:4100/resolve \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=jNQXAC9IVRw"}'
```

Then hand the Kinet worker this box's address:

```
http://<this-server-ip>:4100
```

## Endpoints

| Method | Path        | Body                          | Returns                        |
| ------ | ----------- | ----------------------------- | ------------------------------ |
| GET    | `/health`   | —                             | `{ ok, uptime }`               |
| POST   | `/resolve`  | `{ url }`                     | trimmed yt-dlp metadata JSON   |
| POST   | `/download` | `{ url, quality: 1080/720/480 }` | merged mp4 (streamed)       |
| POST   | `/audio`    | `{ url }`                     | mp3 (streamed)                 |

## Optional hardening

- **Cookies** (more trust with YouTube): put a Netscape `cookies.txt` at
  `secrets/cookies/youtube.txt` next to this file, then
  `docker compose -f docker-compose.extractor.yml up -d`.
- **Token auth** (it's auth-free by default, as requested): set
  `EXTRACTOR_TOKEN` in your shell env before `up -d`; every request must then
  send `x-extractor-token: <value>`. Tell the Kinet side the same value.

## What it does internally

- yt-dlp binary + bgutil PO-token sidecar (same defense pair as the main worker)
- Per-client rotation: `android → tv_simply → web_embedded → default`
- Single-flight pacing between extractions — this is what keeps this box's IP
  clean; do not run a second extractor replica behind the same IP
- 10-minute resolve cache; responses stream, nothing big is buffered in RAM
