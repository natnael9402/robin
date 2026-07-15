# Bugfix Requirements Document

## Introduction

The admin panel's "Force Win" / "Force Loss" / "Real" trade mode controls do not work for trades resolved by the Platform backend. When an admin sets a user's trade mode, the change is written only to `Profile.trade_status` in the OL backend's database. The Platform backend, which owns the actual trade resolution cron job, reads `User.tradeMode` from its own separate database — a field that is never updated by the admin action and defaults to `ALWAYS_LOSS` for every user. As a result, all option trades auto-resolved by the Platform backend always settle as a loss, regardless of what the admin configured.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an admin sets a user's trade mode to "Force Win" via the admin panel THEN the system updates only `Profile.trade_status = 'win'` in the OL database and leaves `User.tradeMode` in the Platform database unchanged

1.2 WHEN the Platform backend cron job resolves an expired option trade for a user whose admin-configured mode is "Force Win" THEN the system reads `User.tradeMode` from the Platform database (which is `'ALWAYS_LOSS'` by default) and resolves the trade as a loss

1.3 WHEN the Platform backend cron job resolves an expired option trade for a user whose admin-configured mode is "Force Loss" THEN the system resolves the trade as a loss (correct outcome, but for the wrong reason — the Platform `tradeMode` default, not the admin's explicit setting)

1.4 WHEN an admin sets a user's trade mode to "Real" THEN the system updates only the OL database; the Platform backend continues to apply `ALWAYS_LOSS` rather than market-based resolution

### Expected Behavior (Correct)

2.1 WHEN an admin sets a user's trade mode to "Force Win" via the admin panel THEN the system SHALL update `User.tradeMode` to `'ALWAYS_WIN'` in the Platform backend's database so that subsequent trade resolutions reflect the admin's intent

2.2 WHEN the Platform backend cron job resolves an expired option trade for a user whose `User.tradeMode` is `'ALWAYS_WIN'` THEN the system SHALL resolve the trade as a win and credit the user with the corresponding payout

2.3 WHEN an admin sets a user's trade mode to "Force Loss" via the admin panel THEN the system SHALL update `User.tradeMode` to `'ALWAYS_LOSS'` in the Platform backend's database

2.4 WHEN an admin sets a user's trade mode to "Real" via the admin panel THEN the system SHALL update `User.tradeMode` to `'REAL'` in the Platform backend's database so that trade resolutions use actual market price comparison

2.5 WHEN the `setTradeMode` admin action completes THEN the system SHALL confirm that both the OL backend and the Platform backend have been updated before returning success

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the Platform backend cron job resolves an expired option trade for a user whose `User.tradeMode` is `'ALWAYS_LOSS'` THEN the system SHALL CONTINUE TO resolve the trade as a loss with zero payout

3.2 WHEN the Platform backend cron job resolves an expired option trade for a user whose `User.tradeMode` is `'REAL'` THEN the system SHALL CONTINUE TO resolve the trade based on whether the market exit price is higher than the entry price

3.3 WHEN an admin uses the per-trade "Force Outcome" action (resolving a specific individual trade) THEN the system SHALL CONTINUE TO resolve that trade immediately with the specified win or loss outcome, independent of `tradeMode`

3.4 WHEN a user places an option trade THEN the system SHALL CONTINUE TO deduct the trade amount from the user's trading balance and open the trade as before

3.5 WHEN a trade is resolved as a win THEN the system SHALL CONTINUE TO calculate payout as `amount + (amount × returnRate / 100)` and credit it to the user's balance

3.6 WHEN a trade is resolved as a loss THEN the system SHALL CONTINUE TO record a pnl of `-amount` with zero payout to the user

3.7 WHEN the admin panel authenticates against the OL backend THEN the system SHALL CONTINUE TO use the existing token-based auth flow without modification

---

## Bug Condition Analysis

**Bug Condition Function** — identifies inputs that trigger the bug:

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type TradeResolutionContext
         where X.adminConfiguredMode is the mode set via admin panel
         and   X.platformTradeMode   is User.tradeMode in Platform DB
  OUTPUT: boolean

  // Bug is triggered whenever the admin has set a non-default mode
  // but the Platform DB still holds the stale default
  RETURN X.adminConfiguredMode IN {'ALWAYS_WIN', 'REAL'}
     AND X.platformTradeMode = 'ALWAYS_LOSS'
     AND X.adminConfiguredMode ≠ X.platformTradeMode
END FUNCTION
```

**Property: Fix Checking**

```pascal
// For all trades resolved while a desync exists between admin intent and Platform DB,
// after the fix the resolution MUST match the admin-configured mode.
FOR ALL X WHERE isBugCondition(X) DO
  result ← resolveOptionTrade'(X)
  ASSERT result.outcome = expectedOutcomeFor(X.adminConfiguredMode)
END FOR
```

**Property: Preservation Checking**

```pascal
// For users whose Platform tradeMode already matches reality (no desync),
// trade resolution behavior must be identical before and after the fix.
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT resolveOptionTrade(X) = resolveOptionTrade'(X)
END FOR
```
