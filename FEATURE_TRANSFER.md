# Internal Account Transfers

Users can move funds between three wallet accounts — **Spot**, **Trading**, and **Fast Trade** — without external deposits or withdrawals.

## Accounts

| Account | Purpose |
|---|---|
| **Spot** | Buy/sell crypto, metals, stocks; holds assets & coin balances |
| **Trading** | Contract/futures trading with leverage |
| **Fast Trade** | 60–180 second option trades |

## Files Created

| File | Purpose |
|---|---|
| `ol/prisma/schema.prisma` | `AccountBalance` model added |
| `ol/dist/transfer/transfer.service.js` | Transfer business logic (DB transaction) |
| `ol/dist/transfer/transfer.controller.js` | Request validation & response |
| `ol/dist/transfer/transfer.routes.js` | `POST /api/transfer` route |
| `platform/frontend/src/features/wallet/components/TransferModal.tsx` | From/To dropdowns, amount input, confirmation |

## Files Modified

| File | Change |
|---|---|
| `ol/dist/auth/auth.service.js` | Seed 3 AccountBalance rows on user registration |
| `ol/dist/user/user.service.js` | Include `accountBalances` in profile query; add `getBalances()` method |
| `ol/dist/user/user.controller.js` | Add `getBalances` handler |
| `ol/dist/user/user.routes.js` | Add `GET /users/balances` |
| `ol/dist/index.js` | Register `"/api/transfer"` router |
| `ol/dist/trade/trade.service.js` | 6 methods updated: `createOptionTrade`, `createContractTrade`, `createSpotTrade`, `createStockTrade`, `resolveTrade`, `cancelTrade` — each now reads/writes the correct `AccountBalance` row + keeps `User.balance` in sync |
| `platform/frontend/src/shared/types/index.ts` | Add `TransferPayload`, add `transfer` to `Transaction.type`, add `accountBalances` to `User` |
| `platform/frontend/src/shared/api/wallet.api.ts` | Add `transfer()` and `getBalances()` methods |
| `platform/frontend/src/shared/api/index.ts` | Export `walletApi` (already exported) |
| `platform/frontend/src/features/wallet/hooks/useWallet.ts` | Add `useTransfer()` mutation hook; update `useWalletData()` to fetch per-type balances |
| `platform/frontend/src/features/trade/hooks/useTradeBalances.ts` | Fetch actual `spot`, `trading`, `fast_trade` balances instead of mirroring `balance` |
| `platform/frontend/src/features/wallet/WalletPage.tsx` | Show 3 balance cards; add Transfer button between Deposit & Withdraw |
| `platform/frontend/src/features/wallet/components/WalletBits.tsx` | `BalanceHeader` updated to accept per-type balances + optional `onTransfer` |

## Database

```prisma
model AccountBalance {
  id        BigInt   @id @default(autoincrement()) @db.BigInt
  user_id   BigInt   @db.BigInt
  type      String   @db.VarChar(50)   // "spot" | "trading" | "fast_trade"
  balance   Decimal  @default(0.00) @db.Decimal(15, 2)
  user      User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, type])
  @@map("account_balances")
}
```

`User.balance` remains the **total** (sum of all three). Updated on every transfer, trade, deposit, and withdrawal.

## API

| Method | Endpoint | Body / Query |
|---|---|---|
| `POST` | `/api/transfer` | `{ from, to, amount }` |
| `GET` | `/api/users/balances` | Returns `{ spot, trading, fast_trade, total }` |

## UI (Wallet Page)

- **3 balance cards** at the top (Spot / Trading / Fast Trade) with respective values
- **Transfer button** between Deposit and Withdraw
- **TransferModal** — From drop-down, To drop-down, amount with max button, confirmation step
- **Transaction history** includes `transfer` type entries

## Trade Pages

- **Fast Trade** (`TradeOptionPage`) → shows `fast_trade` balance
- **Contract Trade** → shows `trading` balance
- **Spot Trade** → shows `spot` balance

## What Does NOT Change

- Auth, forgot/reset password, profile page, chart filters, deposit/withdraw modals
- The overall wallet page layout & scrollable transaction list
- API base URL (`http://localhost:4000/api`)
