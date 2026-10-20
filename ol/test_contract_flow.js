/**
 * End-to-end test for the contract trade changes:
 *  1. $-based TP/SL (take_profit_amount / stop_loss_amount) -> converted price levels
 *  2. Validation: max loss > amount rejected
 *  3. Admin set-win -> contract closes as WON (~min hold 60s) with positive pnl + credit
 *  4. Admin set-loss -> contract closes as LOST with pnl = -amount
 *  5. Profile trade_status reset to original at the end
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
    console.log('\n[3] profile trade_status=win -> forced win after ~60s hold');
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
    console.log('\n[4] profile trade_status=loss -> forced loss after ~60s hold');
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

    console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
    process.exit(fail === 0 ? 0 : 1);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
