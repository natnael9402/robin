# Implementation Plan: Single Market View UI/UX

## Overview

Upgrade `DetailPage.tsx` and `CandlestickChart.tsx` from a minimal functional layout to a premium fintech-grade UI. Work is isolated to two source files plus new helper functions and tests. No new routes or API endpoints are needed. The plan proceeds by: setting up the testing infrastructure, adding pure helper functions (testable first), then layering in each visual sub-component (RangeSelector → AssetHeader → ChartArea → StatGrid → TradePanel → TradeModal), and finally wiring everything together in the `Detail` component.

---

## Tasks

- [x] 1. Set up testing infrastructure
  - Install Vitest, `@testing-library/react`, `@testing-library/jest-dom`, and `fast-check` as dev dependencies
  - Create `vitest.config.ts` at `platform/frontend/` configuring jsdom environment and global test utilities
  - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `platform/frontend/package.json`
  - Create `platform/frontend/src/features/market/__tests__/` directory with a `.gitkeep` to anchor test location
  - _Requirements: all (testing foundation)_

- [x] 2. Implement and test pure helper functions
  - [x] 2.1 Add `formatCompact` and `formatPriceChange` helpers to `DetailPage.tsx`
    - Place both functions at the top of `DetailPage.tsx` (not exported)
    - Implement `formatCompact` per the design's threshold table (T/B/M/K, 1 dp; null/undefined → `'—'`)
    - Implement `formatPriceChange` per the design's sign + 2 dp spec
    - _Requirements: 2.5, 3.3, 3.5_

  - [ ]* 2.2 Write property test for `formatCompact` magnitude suffixes (Property 6)
    - **Property 6: Compact number formatter correctness**
    - **Validates: Requirements 3.3**
    - Use `fc.integer({ min: 0, max: 1e15 })` to cover all suffix tiers; assert correct suffix and 1 dp numeric portion

  - [ ]* 2.3 Write property test for `formatCompact` null/undefined → em dash (Property 7)
    - **Property 7: Null or undefined stat values render em dash**
    - **Validates: Requirements 3.5**
    - Use `fc.constantFrom(null, undefined)`; assert return value is `'—'`

  - [ ]* 2.4 Write property test for `formatPriceChange` formatting invariant (Property 4)
    - **Property 4: Price change display formatting invariant**
    - **Validates: Requirements 2.5**
    - Use `fc.float()` × 2 covering positive, negative, and zero; assert sign prefix, 2 dp, and `%` suffix

- [x] 3. Implement `RangeOption` type, `RANGE_DAYS` map, and `RangeSelector` component
  - [x] 3.1 Add `RangeOption` type and `RANGE_DAYS` constant to `DetailPage.tsx`
    - Define `type RangeOption = '1H' | '24H' | '7D' | '1M' | '3M' | '1Y'`
    - Define `RANGE_DAYS` record per the design's exact mapping
    - _Requirements: 1.1, 1.5_

  - [ ]* 3.2 Write property test for range-to-days mapping correctness (Property 1)
    - **Property 1: Range-to-days mapping correctness**
    - **Validates: Requirements 1.2, 1.5, 1.6**
    - Use `fc.constantFrom('1H','24H','7D','1M','3M','1Y')`; assert each option maps to the exact `days` value from requirements

  - [x] 3.3 Implement `RangeSelector` inline component in `DetailPage.tsx`
    - Render six pill `<button>` elements with labels `1H`, `24H`, `7D`, `1M`, `3M`, `1Y`
    - Active pill: `bg-primary text-primary-foreground font-bold`; inactive: `text-muted-foreground hover:text-foreground`
    - Outer wrapper: `overflow-x-auto flex gap-1 no-scrollbar` with `whitespace-nowrap` on each pill
    - Call `onChange(range)` on click
    - _Requirements: 1.1, 1.3, 1.4, 4.6_

  - [ ]* 3.4 Write property test for exactly one active pill at a time (Property 2)
    - **Property 2: Exactly one range pill is active at a time**
    - **Validates: Requirements 1.3**
    - Render `RangeSelector` with every possible `RangeOption` via `fc.constantFrom`; assert exactly one button carries `bg-primary` and zero others do

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement `AssetHeader` component
  - [x] 5.1 Implement `AssetHeader` inline component in `DetailPage.tsx`
    - Render logo `<img>` with `onError` fallback to `<span>` showing `item.symbol.toUpperCase()`
    - Price: `text-4xl font-black font-mono` (≥ 36 px)
    - Change line using `formatPriceChange`; apply `text-primary` + `TrendingUp` icon for `change >= 0`, `text-destructive` + `TrendingDown` for `change < 0`
    - Skeleton: four `<Skeleton>` elements — `w-12 h-12 rounded-full`, `w-32 h-5`, `w-48 h-9`, `w-36 h-4`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 5.2 Write property test for colour class by sign of 24h change (Property 3)
    - **Property 3: Colour class reflects sign of 24h change**
    - **Validates: Requirements 2.2, 2.3**
    - Use `fc.float()` covering positive and negative values; render `AssetHeader` and assert `text-primary`/`TrendingUp` for `>= 0` and `text-destructive`/`TrendingDown` for `< 0`

  - [ ]* 5.3 Write unit tests for `AssetHeader` skeleton and image fallback
    - Assert skeleton renders four placeholders when `isLoading` prop is set
    - Assert fallback `<span>` with uppercase ticker renders when image `onError` fires
    - _Requirements: 2.6, 2.7_

- [x] 6. Implement `StatGrid` component
  - [x] 6.1 Implement `StatGrid` inline component in `DetailPage.tsx`
    - Grid layout: `grid grid-cols-2 sm:grid-cols-4 gap-3`
    - Render four `StatCard` instances: Market Cap (`formatCompact`), 24h Volume (`formatCompact`), 24h High (`formatCurrency` 2 dp), 24h Low (`formatCurrency` 2 dp)
    - Pass `'—'` when the field is `null` or `undefined`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.2 Write property test for StatGrid renders exactly 4 cards (Property 5)
    - **Property 5: Stat grid renders exactly 4 cards for any valid asset**
    - **Validates: Requirements 3.1**
    - Use `fc.record(...)` generating valid `MarketCoin` objects with numeric stat fields; assert exactly 4 stat card elements are rendered, each with its label

- [x] 7. Upgrade `CandlestickChart.tsx`
  - [x] 7.1 Add dark card wrapper, grid opacity, and axis label styling to `CandlestickChart.tsx`
    - Wrap chart `<div>` in outer container: `background: '#0b1120'`, `borderRadius: 16px`
    - Set grid `borderColor: 'rgba(255,255,255,0.06)'`
    - Set axis label `style: { colors: '#5b6472', fontSize: '11px' }` on both axes
    - Keep `animations.enabled: false`
    - _Requirements: 5.1, 5.3, 5.4, 5.7_

  - [x] 7.2 Add OHLC custom tooltip to `CandlestickChart.tsx`
    - Implement `tooltip.custom` callback returning formatted rows for `O`, `H`, `L`, `C` each with `$X,XXX.XX` formatting
    - Date/time row formatted as `DD MMM YYYY HH:mm`
    - _Requirements: 5.5_

  - [ ]* 7.3 Write property test for OHLC tooltip formatter (Property 8)
    - **Property 8: OHLC tooltip formatter produces all four labelled values**
    - **Validates: Requirements 5.5**
    - Use `fc.record({ open, high, low, close })` with `fc.float({ min: 1 })`; invoke the tooltip function and assert all four labels (`O:`, `H:`, `L:`, `C:`) are present with dollar-formatted values

  - [x] 7.4 Set candle colours in `CandlestickChart.tsx`
    - Up candles: Design_System `primary` colour; down candles: Design_System `destructive` colour; wick colours match respective fills
    - _Requirements: 5.2_

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement `ChartArea` wrapper and integrate fade-in animation
  - [x] 9.1 Implement `ChartArea` inline component in `DetailPage.tsx`
    - Conditional render: `history.isLoading` → `<Skeleton>` at chart height; `history.isError` → "Chart data unavailable" text; `data.length === 0` → "No chart data available for this range"; else → `<div key={selectedRange} className="chart-fadein"><CandlestickChart /></div>`
    - Chart height: `min-h-[260px] sm:min-h-[360px]`, width 100% of container
    - _Requirements: 1.7, 1.8, 1.9, 4.4, 4.5, 5.6, 7.3_

  - [x] 9.2 Add `chart-fadein` CSS animation to global stylesheet
    - Define `@keyframes chartFadeIn` with opacity 0→1 and duration ≤ 400 ms
    - Apply via `.chart-fadein` class in global CSS
    - _Requirements: 5.6_

- [ ] 10. Implement `TradePanel` and upgrade `TradeModal`
  - [x] 10.1 Implement `TradePanel` sticky component in `DetailPage.tsx`
    - Replace the inline button grid with `fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]`
    - Show current price above buttons: `font-mono font-black text-foreground text-base`
    - Buy button: `variant="lime" size="lg" fullWidth`; Sell button: `variant="danger" size="lg" fullWidth`
    - Add `pb-28` to the page content wrapper to prevent panel overlap
    - _Requirements: 4.3, 6.1, 6.2, 6.3_

  - [x] 10.2 Wire `TradePanel` buttons to open `TradeModal` with `type` and pre-populated `amount = '100'`
    - Buy click → `setTradeType('buy'); setTradeOpen(true)`
    - Sell click → `setTradeType('sell'); setTradeOpen(true)`
    - _Requirements: 6.4, 6.5_

  - [x] 10.3 Upgrade `TradeModal` with live estimate and inline validation
    - Add `amount` state (`'100'`) and `validationError` state (`null`)
    - Compute estimate inline: buy → `amount / price` units; sell → `amount * price` proceeds; render below input
    - Validate on submit: empty/non-numeric → "Please enter a valid amount"; zero/negative → "Amount must be greater than 0"; render as `<p className="text-xs text-destructive mt-1">`
    - _Requirements: 6.6, 6.7, 6.8_

  - [ ]* 10.4 Write property test for trade estimate calculation (Property 9)
    - **Property 9: Trade estimate calculation correctness**
    - **Validates: Requirements 6.6**
    - Use `fc.float({ min: 0.01 })` × 2 for amount and price; assert `buy → amount/price` and `sell → amount*price`

  - [ ]* 10.5 Write property test for zero/negative amount validation (Property 10)
    - **Property 10: Zero or negative amount triggers specific validation message**
    - **Validates: Requirements 6.7**
    - Use `fc.float({ max: 0 })`; call validation function and assert message is `"Amount must be greater than 0"` with no API call

  - [ ]* 10.6 Write property test for non-numeric/empty amount validation (Property 11)
    - **Property 11: Non-numeric or empty input triggers specific validation message**
    - **Validates: Requirements 6.8**
    - Use `fc.string()` filtered to NaN-producing inputs; assert message is `"Please enter a valid amount"` with no API call

- [ ] 11. Wire everything together in `Detail` component and apply responsive layout
  - [ ] 11.1 Integrate all sub-components into `Detail` in `DetailPage.tsx`
    - Add `selectedRange` state (`'7D'`), `tradeOpen` state, and `tradeType` state
    - Wire `history` query key to include `selectedRange`; map `RANGE_DAYS[selectedRange]` and `interval` (`1H`/`24H` → `'1h'`, others → `'1d'`) for the API call
    - Compose: `AssetHeader` → `RangeSelector` → `ChartArea` → `StatGrid` → `TradePanel` → `TradeModal`
    - Full-page skeleton on `detail.isLoading`; "Asset not found" + back link on `!detail.data`
    - _Requirements: 1.2, 1.4, 1.5, 1.6, 4.1, 4.2, 7.1, 7.2, 7.3_

  - [ ] 11.2 Apply mobile-first responsive layout classes to `DetailPage.tsx`
    - Page wrapper: single-column, `max-w-screen-md mx-auto`, no horizontal overflow
    - Chart container: `w-full min-h-[260px] sm:min-h-[360px]`
    - Confirm `pb-28` padding on scroll area so `TradePanel` doesn't obscure content
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [ ]* 11.3 Write unit tests for `Detail` integration states
    - Assert full skeleton renders when `detail.isLoading`
    - Assert "Asset not found" + back link when `detail.data` is null
    - Assert `RangeSelector` defaults to `7D` on initial render
    - Assert `getCryptoHistory` is called with correct `days` on range change
    - _Requirements: 1.4, 7.1, 7.2_

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design specifies **fast-check** for property-based tests (minimum 100 iterations per property)
- No new routes, API endpoints, or shared components are introduced — all work is in `DetailPage.tsx` and `CandlestickChart.tsx`
- Tag format for PBT: `Feature: single-market-view-ui-ux, Property N: <property text>`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.2", "3.3"] },
    { "id": 3, "tasks": ["3.4", "5.1", "6.1", "7.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.2", "7.2", "7.4"] },
    { "id": 5, "tasks": ["7.3", "9.1", "9.2", "10.1"] },
    { "id": 6, "tasks": ["10.2", "10.3"] },
    { "id": 7, "tasks": ["10.4", "10.5", "10.6", "11.1"] },
    { "id": 8, "tasks": ["11.2"] },
    { "id": 9, "tasks": ["11.3"] }
  ]
}
```
