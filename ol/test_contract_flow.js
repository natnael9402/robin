/**
 * End-to-end test for the contract trade changes:
 *  1. $-based TP/SL (take_profit_amount / stop_loss_amount) -> converted price levels
 *  2. Validation: max loss > amount rejected
 *  3. Admin set-win -> contract closes as WON at expiry (~60s) with positive pnl + credit
 *  4. Admin set-loss -> contract closes as LOST at expiry with pnl = -amount
 *  5. Gold/silver routing regressions + $ TP conversion on metals
 *  6. Take Profit / Stop Loss user close buttons (POST /trades/:id/close)
 *  7. Natural auto-expiry: bare contract closes itself at ~60s, live-pnl decides won/lost
 *
 * Run: node test_contract_flow.js
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
// Use the same generated Prisma client the running backend uses.
const prisma = require('./dist/prisma').default;

const API = `http://localhost:4000/api/trades`;

function userToken(id, email) {
  return jwt.sign({ id: String(id), email, role: 'USER' }, process.env.JWT_SECRET, { expiresIn: '2h' });
}
function adminToken() {
  return jwt.sign({ id: String(1), email: 'admin@test', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

async function api(method, path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

const fmt = (n) => Number(String(n)).toFixed(2);
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${extra ? '  [' + extra + ']' : ''}`); }
}

async function getTradingBalance(userId) {
  const acc = await prisma.accountBalance.findUnique({ where: { user_id_type: { user_id: userId, type: 'trading' } } });
  return acc ? Number(acc.balance) : 0;
}

async function ensureTradingBalance(userId, min) {
  let bal = await getTradingBalance(userId);
  if (bal < min) {
    await prisma.accountBalance.upsert({
      where: { user_id_type: { user_id: userId, type: 'trading' } },
      update: { balance: min },
      create: { user_id: userId, type: 'trading', balance: min },
    });
    console.log(`  (topped up trading balance to ${min} for test user)`);
    bal = min;
  }
  return bal;
}

async function pollUntilClosed(tradeId, token, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const { status, json } = await api('GET', `/${tradeId}`, token);
    if (status !== 200 || !json?.trade) { console.log(`    poll status=${status}`); }
    else if (json.trade.status === 'closed') return json.trade;
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}

(async () => {
  try {
    // ---- pick a user ------------------------------------------------------
    const user = await prisma.user.findFirst({
      where: { role: { in: ['user'] } },
      orderBy: { id: 'desc' },
    });
    if (!user) throw new Error('No user found in DB');
    console.log(`Test user: #${user.id} ${user.email}`);

    const profile = await prisma.profile.findFirst({ where: { user_id: user.id }, orderBy: { created_at: 'desc' } });
    const originalStatus = profile?.trade_status ?? null;
    console.log(`Original profile trade_status: ${originalStatus}`);

    const token = userToken(user.id, user.email);
    const admin = adminToken();

    // ---- 1. create contract with $ TP/SL ----------------------------------
    console.log('\n[1] POST /trades/contract with take_profit_amount=50, stop_loss_amount=30 (buy, 10x, $100)');
    await ensureTradingBalance(user.id, 500);
    const balBefore = await getTradingBalance(user.id);
    const r1 = await api('POST', '/contract', token, {
      symbol: 'BTCUSDT', direction: 'buy', amount: 100, leverage: 10,
      take_profit_amount: 50, stop_loss_amount: 30,
    });
    if (r1.status !== 201) { console.log(r1.json); throw new Error('Contract creation failed'); }
    const trade1 = r1.json.trade;
    const entry = Number(trade1.entry_price);
    const tpLevel = trade1.contract?.take_price ?? trade1.contract?.take_profit;
    const tp = trade1.contract?.take_profit ? Number(trade1.contract.take_profit) : null;
    const sl = trade1.contract?.stop_loss ? Number(trade1.contract.stop_loss) : null;
    console.log(`  entry=${entry}  tp=${tp}  sl=${sl}  liq=${trade1.contract?.liquidation_price}`);
    const expectedTp = entry * 1.05, expectedSl = entry * 0.97; // $50/$30 @ $100 margin 10x -> 5%/3%
    check('TP level = entry x 1.05', tp !== null && Math.abs(tp - expectedTp) / expectedTp < 0.001, `got ${tp} want ${expectedTp.toFixed(4)}`);
    check('SL level = entry x 0.97', sl !== null && Math.abs(sl - expectedSl) / expectedSl < 0.001, `got ${sl} want ${expectedSl.toFixed(4)}`);
    const balAfterCreate = await getTradingBalance(user.id);
    check('margin+2% fee deducted', Math.abs((balBefore - balAfterCreate) - 102) < 0.01, `before=${fmt(balBefore)} after=${fmt(balAfterCreate)}`);

    // ---- 2. validation rejection ------------------------------------------
    console.log('\n[2] stop_loss_amount > amount must be rejected');
    const r2 = await api('POST', '/contract', token, { symbol: 'BTCUSDT', direction: 'buy', amount: 100, leverage: 10, stop_loss_amount: 120 });
    check('rejected with 400', r2.status === 400, `status=${r2.status} body=${JSON.stringify(r2.json).slice(0, 120)}`);

    // ---- 3. set-win forced resolution --------------------------------------
    console.log('\n[3] profile trade_status=win -> forced win resolves at expiry (~60s)');
    await prisma.$transaction(async (tx) => {
      const p = await tx.profile.findFirst({ where: { user_id: user.id }, orderBy: { created_at: 'desc' } });
      if (!p) throw new Error('profile missing');
      await tx.profile.update({ where: { id: p.id }, data: { trade_status: 'win' } });
    });
    const balPreWin = await getTradingBalance(user.id);
    const r3 = await api('POST', '/contract', token, { symbol: 'BTCUSDT', direction: 'buy', amount: 200, leverage: 10 });
    if (r3.status !== 201) { console.log(r3.json); throw new Error('[3] create failed'); }
    const trade3 = r3.json.trade;
    // also cancel trade1 to keep things clean
    await api('POST', `/${BigInt(trade1.id).toString()}/cancel`, token);
    const closed3 = await pollUntilClosed(String(trade3.id), token, 140000);
    if (!closed3) throw new Error('[3] trade did not close within 140s');
    console.log(`  resolved: result=${closed3.result} exit=${closed3.exit_price} entry=${closed3.entry_price} pnl=${closed3.pnl}`);
    check('result = won', closed3.result === 'won');
    check('pnl > 0', Number(closed3.pnl) > 0, `pnl=${fmt(closed3.pnl)}`);
    const exitNum = Number(closed3.exit_price), entryNum = Number(closed3.entry_price);
    check('exit favorable vs entry (buy)', exitNum > entryNum, `${exitNum} vs ${entryNum}`);
    const balPostWin = await getTradingBalance(user.id);
    const winAmount = balPostWin - balPreWin + 0; // credit = amount + pnl
    check('trading balance credited results from forced win', winAmount > 0, `credit=${fmt(winAmount)}`);

    // ---- 4. set-loss forced resolution --------------------------------------
    console.log('\n[4] profile trade_status=loss -> forced loss resolves at expiry (~60s)');
    await prisma.$transaction(async (tx) => {
      const p = await tx.profile.findFirst({ where: { user_id: user.id }, orderBy: { created_at: 'desc' } });
      await tx.profile.update({ where: { id: p.id }, data: { trade_status: 'loss' } });
    });
    const r4 = await api('POST', '/contract', token, { symbol: 'BTCUSDT', direction: 'sell', amount: 150, leverage: 5 });
    if (r4.status !== 201) { console.log(r4.json); throw new Error('[4] create failed'); }
    const trade4 = r4.json.trade;
    const closed4 = await pollUntilClosed(String(trade4.id), token, 140000);
    if (!closed4) throw new Error('[4] trade did not close within 140s');
    console.log(`  resolved: result=${closed4.result} exit=${closed4.exit_price} pnl=${closed4.pnl}`);
    check('result = lost', closed4.result === 'lost');
    check('pnl = -amount', Math.abs(Number(closed4.pnl) + 150) < 0.01, `pnl=${fmt(closed4.pnl)}`);

    // ---- 5. gold contract WITHOUT market_type (misroute regression) ---------
    console.log('\n[5] POST /trades/contract symbol=XAUUSD/USD, no market_type -> must route as metals');
    const r5 = await api('POST', '/contract', token, {
      symbol: 'XAUUSD/USD', direction: 'buy', amount: 100, leverage: 10,
      take_profit_amount: 20, stop_loss_amount: 10,
    });
    if (r5.status === 201) {
      const trade5 = r5.json.trade;
      const entry5 = Number(trade5.entry_price);
      const tp5 = trade5.contract?.take_profit ? Number(trade5.contract.take_profit) : null;
      console.log(`  market_type=${trade5.market_type} entry=${entry5} tp=${tp5}`);
      check('market_type = metals', trade5.market_type === 'metals', `got ${trade5.market_type}`);
      check('gold entry price plausible (> $1000)', entry5 > 1000, `entry=${entry5}`);
      check('$ TP converted (entry x 1.02)', tp5 !== null && Math.abs(tp5 - entry5 * 1.02) / (entry5 * 1.02) < 0.001, `tp=${tp5}`);
      await api('POST', `/${trade5.id}/cancel`, token);
    } else {
      fail += 3;
      pass += 0;
      console.log(`  FAIL  gold contract creation -> status=${r5.status} body=${JSON.stringify(r5.json).slice(0, 160)}`);
    }

    // ---- 5b. silver + metals family (XAGUSD/USD) ----------------------------
    console.log('\n[5b] POST /trades/contract symbol=XAGUSD/USD (silver) -> metals');
    const r5b = await api('POST', '/contract', token, {
      symbol: 'XAGUSD/USD', direction: 'buy', amount: 100, leverage: 10,
      take_profit_amount: 20, stop_loss_amount: 10,
    });
    if (r5b.status === 201) {
      const trade5b = r5b.json.trade;
      const entry5b = Number(trade5b.entry_price);
      console.log(`  market_type=${trade5b.market_type} entry=${entry5b}`);
      check('silver market_type = metals', trade5b.market_type === 'metals', `got ${trade5b.market_type}`);
      check('silver entry price plausible (> $5)', entry5b > 5, `entry=${entry5b}`);
      await api('POST', `/${trade5b.id}/cancel`, token);
    } else {
      fail += 2;
      pass += 0;
      console.log(`  FAIL  silver contract creation -> status=${r5b.status} body=${JSON.stringify(r5b.json).slice(0, 160)}`);
    }

    // ---- reset profile status ----------------------------------------------
    await prisma.$transaction(async (tx) => {
      const p = await tx.profile.findFirst({ where: { user_id: user.id }, orderBy: { created_at: 'desc' } });
      if (p) await tx.profile.update({ where: { id: p.id }, data: { trade_status: originalStatus } });
    });

    // ---- 6. user close buttons: POST /trades/:id/close {outcome} ------------
    console.log('\n[6] Take Profit / Stop Loss buttons (POST /trades/:id/close)');
    // 6a. configured TP (>= $500) is honored exactly
    const r6a = await api('POST', '/contract', token, {
      symbol: 'BTCUSDT/USD', direction: 'buy', amount: 100, leverage: 10,
      take_profit_amount: 600, stop_loss_amount: 100,
    });
    if (r6a.status === 201) {
      const c6a = await api('POST', `/${r6a.json.trade.id}/close`, token, { outcome: 'WIN' });
      if (c6a.status === 200) {
        const t6a = c6a.json.trade;
        const pnl6a = Number(t6a.pnl);
        console.log(`  take profit close: result=${t6a.result} pnl=${pnl6a}`);
        check('Take Profit button -> closed & won', t6a.status === 'closed' && t6a.result === 'won', `${t6a.status}/${t6a.result}`);
        check('TP-honored profit = $600', Math.abs(pnl6a - 600) < 0.5, `pnl=${pnl6a}`);
      } else {
        fail += 2; pass += 0;
        console.log(`  FAIL  take profit close -> status=${c6a.status} body=${JSON.stringify(c6a.json).slice(0, 160)}`);
      }
    } else {
      fail += 2; pass += 0;
      console.log(`  FAIL  close setup trade (6a) -> status=${r6a.status} body=${JSON.stringify(r6a.json).slice(0, 160)}`);
    }

    // 6b. no TP configured -> realistic random profit $500-$1500
    const r6b = await api('POST', '/contract', token, {
      symbol: 'BTCUSDT/USD', direction: 'buy', amount: 100, leverage: 10,
    });
    if (r6b.status === 201) {
      const c6b = await api('POST', `/${r6b.json.trade.id}/close`, token, { outcome: 'WIN' });
      if (c6b.status === 200) {
        const pnl6b = Number(c6b.json.trade.pnl);
        console.log(`  bare take profit close: pnl=${pnl6b}`);
        check('no-TP close pays between $500-$1500', pnl6b >= 500 && pnl6b <= 1500, `pnl=${pnl6b}`);
      } else {
        fail += 1; pass += 0;
        console.log(`  FAIL  6b close -> status=${c6b.status} body=${JSON.stringify(c6b.json).slice(0, 160)}`);
      }
    } else {
      fail += 1; pass += 0;
      console.log(`  FAIL  close setup trade (6b) -> status=${r6b.status}`);
    }

    // 6c. Stop Loss button -> lost, margin consumed
    const r6c = await api('POST', '/contract', token, {
      symbol: 'BTCUSDT/USD', direction: 'buy', amount: 100, leverage: 10,
      stop_loss_amount: 60,
    });
    if (r6c.status === 201) {
      const c6c = await api('POST', `/${r6c.json.trade.id}/close`, token, { outcome: 'LOSS' });
      if (c6c.status === 200) {
        const t6c = c6c.json.trade;
        const pnl6c = Number(t6c.pnl);
        console.log(`  stop loss close: result=${t6c.result} pnl=${pnl6c}`);
        check('Stop Loss button -> closed & lost', t6c.status === 'closed' && t6c.result === 'lost', `${t6c.status}/${t6c.result}`);
        check('stop loss consumes the margin (-amount)', pnl6c === -100, `pnl=${pnl6c}`);
      } else {
        fail += 2; pass += 0;
        console.log(`  FAIL  stop loss close -> status=${c6c.status} body=${JSON.stringify(c6c.json).slice(0, 160)}`);
      }
    } else {
      fail += 2; pass += 0;
      console.log(`  FAIL  close setup trade (6c) -> status=${r6c.status}`);
    }

    // 6d. invalid outcome rejected
    const r6d = await api('POST', '/contract', token, {
      symbol: 'BTCUSDT/USD', direction: 'buy', amount: 100, leverage: 10,
    });
    if (r6d.status === 201) {
      const c6d = await api('POST', `/${r6d.json.trade.id}/close`, token, { outcome: 'MAYBE' });
      check('invalid outcome rejected', c6d.status === 422 || c6d.status === 400, `status=${c6d.status}`);
      if (c6d.status === 200) {
        // shouldn't happen, but keep the test DB clean
        await prisma.trade.delete({ where: { id: BigInt(r6d.json.trade.id) } }).catch(() => {});
      }
    } else {
      fail += 1; pass += 0;
      console.log(`  FAIL  close setup trade (6d) -> status=${r6d.status}`);
    }

    // ---- 7. natural auto-expiry ---------------------------------------------
    console.log('\n[7] bare contract (no TP/SL) must auto-close at ~60s, live-pnl decides');
    const r7 = await api('POST', '/contract', token, {
      symbol: 'BTCUSDT', direction: 'buy', amount: 100, leverage: 10,
    });
    if (r7.status !== 201) { console.log(r7.json); throw new Error('[7] create failed'); }
    const trade7 = r7.json.trade;
    const openedMs = new Date(trade7.opened_at).getTime();
    console.log(`  created: id=${trade7.id} opened_at=${trade7.opened_at}`);
    const closed7 = await pollUntilClosed(String(trade7.id), token, 125000);
    if (!closed7) throw new Error('[7] trade did NOT auto-close within 125s (expiry broken)');
    const elapsedSec = (new Date(closed7.closed_at).getTime() - openedMs) / 1000;
    console.log(`  auto-closed after ${elapsedSec.toFixed(1)}s: result=${closed7.result} exit=${closed7.exit_price} pnl=${closed7.pnl}`);
    check('auto-expiry closed', closed7.status === 'closed');
    check('result is won or lost', closed7.result === 'won' || closed7.result === 'lost', closed7.result);
    check('closed around 60s (58-80s window)', elapsedSec >= 58 && elapsedSec <= 80, `elapsed=${elapsedSec.toFixed(1)}`);
    check('exit price present', Number(closed7.exit_price) > 0, `exit=${closed7.exit_price}`);
    if (closed7.result === 'lost') {
      check('expiry loss consumes margin (-amount)', Math.abs(Number(closed7.pnl) + 100) < 0.01, `pnl=${fmt(closed7.pnl)}`);
    } else {
      const pnl7 = Number(closed7.pnl);
      check('expiry win pays positive pnl', pnl7 > 0, `pnl=${fmt(pnl7)}`);
    }

    console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
    process.exit(fail === 0 ? 0 : 1);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
