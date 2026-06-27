# Design Document — Single Market View UI/UX

## Overview

This design upgrades the single asset detail page (`/market/crypto/:id`) from a minimal functional layout to a premium, fintech-grade UI.  
All work is contained in two files: `DetailPage.tsx` (main page) and `CandlestickChart.tsx` (chart component). No new routes, no new API endpoints, and no new shared components are introduced — every building block already exists in the design system.

The key additions and changes are:

- **RangeSelector** — an inline sub-component with 6 time-range pills, wired to re-fetch chart data with the correct `days` argument.
- **Asset Header** — larger price, side-by-side absolute + % change, image fallback, and a 4-placeholder skeleton.
- **Stat Grid** — 4 `StatCard` instances (Market Cap, 24h Volume, 24h High, 24h Low), 2-col / 4-col responsive, compact number formatting helper.
- **Sticky Trade Panel** — `fixed bottom-0` bar with price shown above the Buy/Sell buttons.
- **TradeModal improvements** — live estimate calculation, two distinct inline validation messages.
- **CandlestickChart upgrades** — dark card wrapper, OHLC tooltip, fade-in animation via `key` prop reset.
- **Loading / error states** — full-page skeleton, "Asset not found" with back link, chart-area-only error fallback.

---

## Architecture

The page is a single React client component tree. Data flows top-down from two TanStack Query hooks inside the `Detail` function component; no global state store is involved.

```
CryptoDetailPage (route shell)
  └─ Detail (id, type)
       ├─ useQuery: detail  ← marketApi.getCryptoDetail(id)
       ├─ useQuery: history ← marketApi.getCryptoHistory(id, days)
       │     ↑ days driven by selectedRange state
       ├─ AssetHeader
       ├─ RangeSelector       ← new inline component
       ├─ ChartArea           ← wrapper that renders skeleton / error / CandlestickChart
       ├─ StatGrid
       ├─ TradePanel (sticky) ← replaces inline button grid
       └─ TradeModal
```

State owned by `Detail`:

| State variable    | Type                          | Initial value |
|-------------------|-------------------------------|---------------|
| `selectedRange`   | `RangeOption`                 | `'7D'`        |
| `tradeOpen`       | `boolean`                     | `false`       |
| `tradeType`       | `'buy' \| 'sell'`             | `'buy'`       |

The `history` query key includes `selectedRange` so TanStack Query automatically re-fetches when the range changes:

```ts
queryKey: ['market', type, id, 'history', selectedRange]
```

---

## Components and Interfaces

### RangeSelector

A new **inline** component defined inside `DetailPage.tsx` (not exported to shared). It renders six pill buttons and calls a setter when one is clicked.

```ts
type RangeOption = '1H' | '24H' | '7D' | '1M' | '3M' | '1Y';

const RANGE_DAYS: Record<RangeOption, number> = {
  '1H':  1,
  '24H': 1,
  '7D':  7,
  '1M':  30,
  '3M':  90,
  '1Y':  365,
};

interface RangeSelectorProps {
  value: RangeOption;
  onChange: (range: RangeOption) => void;
}
```

Layout: `overflow-x-auto` scrollable row, `flex gap-1 no-scrollbar`. Each pill is a `<button>` with `whitespace-nowrap` to prevent wrapping on narrow viewports. Active pill: `bg-primary text-primary-foreground font-bold`; inactive: `text-muted-foreground hover:text-foreground`.

### AssetHeader

Inline component inside `DetailPage.tsx`.

```ts
interface AssetHeaderProps {
  item: MarketCoin;          // from getCryptoDetail
  change: number;            // safeNumber(price_change_percentage_24h)
  absoluteChange: number;    // current_price - price_24h_ago (or from market data)
}
```

Key details:
- Price: `text-4xl font-black font-mono` (≥ 36 px).
- Change line: `+$124.50  +2.34%` — formatted with a `formatPriceChange` helper (see Data Models).
- Logo: `<img onError={handleImgError}>` with `useState` fallback that renders the ticker symbol in a `<span>` if the image fails.
- Skeleton: four `<Skeleton>` elements — `w-12 h-12 rounded-full` (logo), `w-32 h-5` (name), `w-48 h-9` (price), `w-36 h-4` (change).

### ChartArea

Inline wrapper that conditionally renders skeleton / error / empty / chart:

```
if (history.isLoading)  → <Skeleton className="w-full" style={{ height }} />
if (history.isError)    → centered "Chart data unavailable" text
if (data.length === 0)  → centered "No chart data available for this range"
else                    → <div key={dataKey} className="chart-fadein"><CandlestickChart /></div>
```

The `key` prop is set to `selectedRange` so React unmounts/remounts the wrapper whenever the range changes, triggering the CSS fade-in animation.

### CandlestickChart (upgraded)

Changes to `CandlestickChart.tsx`:

1. **Dark card wrapper** — the component wraps its chart `<div>` in an outer container with `background: '#0b1120'`, `borderRadius: 16px`.
2. **Grid opacity** — `borderColor: 'rgba(255,255,255,0.06)'` (≤ 0.08).
3. **Axis label size** — `style: { colors: '#5b6472', fontSize: '11px' }` on both axes.
4. **OHLC tooltip** — custom `tooltip.custom` callback that formats four labelled rows: `O`, `H`, `L`, `C` each formatted as `$X,XXX.XX`.
5. **Fade-in animation** — handled by the parent `ChartArea` key-reset approach; the chart component itself keeps `animations.enabled: false` for performance.

Updated prop interface is unchanged (data + height); all changes are internal to the ApexOptions config.

### StatGrid

Inline component inside `DetailPage.tsx`. Uses the existing `StatCard` component.

```ts
interface StatGridProps {
  item: MarketCoin;
}
```

Grid layout: `grid grid-cols-2 sm:grid-cols-4 gap-3`.

Stats rendered:
| Label | Field | Formatter |
|-------|-------|-----------|
| Market Cap | `market_cap` | `formatCompact` |
| 24h Volume | `total_volume` | `formatCompact` |
| 24h High | `high_24h` | `formatCurrency` (2dp) |
| 24h Low | `low_24h` | `formatCurrency` (2dp) |

If a field is `null` or `undefined`, renders `—`.

### TradePanel

Replaces the inline `grid grid-cols-2` button row. Markup:

```tsx
<div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-t border-border
                px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
  <div className="max-w-screen-sm mx-auto">
    <div className="text-center text-xs text-muted-foreground mb-2">
      <span className="font-mono font-black text-foreground text-base">
        ${formatCurrency(item.current_price)}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Button variant="lime" size="lg" fullWidth onClick={...}>Buy</Button>
      <Button variant="danger" size="lg" fullWidth onClick={...}>Sell</Button>
    </div>
  </div>
</div>
```

The page content area gets `pb-28` to prevent the sticky panel from obscuring content.

### TradeModal (upgraded)

Two new pieces of state added:

```ts
const [amount, setAmount] = useState('100');
const [validationError, setValidationError] = useState<string | null>(null);
```

**Live estimate** — computed inline from `amount` and `price`:

```ts
const numAmount = parseFloat(amount);
const estimate = isNaN(numAmount) || numAmount <= 0
  ? null
  : type === 'buy'
    ? numAmount / price   // units
    : numAmount * price;  // proceeds
```

Rendered as: `≈ 0.00142 BTC` (buy) or `≈ $6,834.20` (sell), updated on every `amount` state change (no debounce needed — pure computation).

**Validation** — run inside `handle()` before the API call:

```ts
const num = parseFloat(amount);
if (amount.trim() === '' || isNaN(num)) {
  setValidationError('Please enter a valid amount');
  return;
}
if (num <= 0) {
  setValidationError('Amount must be greater than 0');
  return;
}
setValidationError(null);
```

Error message rendered as `<p className="text-xs text-destructive mt-1">{validationError}</p>` directly below the `Input`.

---

## Data Models

### RangeOption

```ts
type RangeOption = '1H' | '24H' | '7D' | '1M' | '3M' | '1Y';

const RANGE_DAYS: Record<RangeOption, number> = {
  '1H': 1, '24H': 1, '7D': 7, '1M': 30, '3M': 90, '1Y': 365,
};
```

### formatCompact helper

A new pure function added at the top of `DetailPage.tsx` (not exported):

```ts
function formatCompact(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000)     return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000)         return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)             return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}
```

### formatPriceChange helper

```ts
function formatPriceChange(absoluteChange: number, percentChange: number): string {
  const sign = absoluteChange >= 0 ? '+' : '-';
  const absVal = Math.abs(absoluteChange).toFixed(2);
  const pctSign = percentChange >= 0 ? '+' : '-';
  const pctVal = Math.abs(percentChange).toFixed(2);
  return `${sign}$${absVal}  ${pctSign}${pctVal}%`;
}
```

### MarketCoin (relevant fields)

The existing `MarketCoin` type is used as-is. Fields accessed on this page:

```ts
{
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_24h: number;       // used for absolute change
  market_cap: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is a UI page with several pure helper functions (formatCompact, formatPriceChange, validation logic, estimate calculation) and a range→days mapping that are well-suited to property-based testing. The UI interaction and CSS layout requirements are covered by example-based tests.

---

### Property 1: Range-to-days mapping correctness

*For any* `RangeOption` value in `{1H, 24H, 7D, 1M, 3M, 1Y}`, looking up that option in `RANGE_DAYS` must return the exact days value specified in the requirements (`1H→1`, `24H→1`, `7D→7`, `1M→30`, `3M→90`, `1Y→365`), and `marketApi.getCryptoHistory` must be called with that exact value when the range is selected.

**Validates: Requirements 1.2, 1.5, 1.6**

---

### Property 2: Exactly one range pill is active at a time

*For any* selected `RangeOption`, after a selection event the active styling class is applied to exactly one pill — the newly selected one — and zero other pills carry the active class.

**Validates: Requirements 1.3**

---

### Property 3: Colour class reflects sign of 24h change

*For any* numeric `change` value: if `change >= 0`, the Asset_Header change element carries the `text-primary` class and the `TrendingUp` icon is rendered; if `change < 0`, the element carries `text-destructive` and `TrendingDown` is rendered. No other combination is valid.

**Validates: Requirements 2.2, 2.3**

---

### Property 4: Price change display formatting invariant

*For any* absolute change value `a` and percentage change value `p`, `formatPriceChange(a, p)` must satisfy all of:
- The absolute part is prefixed with `+` when `a >= 0` and `-` when `a < 0`
- The absolute part is formatted to exactly two decimal places
- The percentage part is prefixed with `+` when `p >= 0` and `-` when `p < 0`
- The percentage part is formatted to exactly two decimal places and ends with `%`

**Validates: Requirements 2.5**

---

### Property 5: Stat grid renders exactly 4 cards for any valid asset

*For any* `MarketCoin` object with all four stat fields present (market_cap, total_volume, high_24h, low_24h), the `StatGrid` component must render exactly 4 stat card elements, each containing its corresponding label string.

**Validates: Requirements 3.1**

---

### Property 6: Compact number formatter correctness

*For any* non-negative number `n`, `formatCompact(n)` must use the correct suffix according to magnitude:
- `n >= 1_000_000_000_000` → output ends with `T`
- `n >= 1_000_000_000` (and < T threshold) → output ends with `B`
- `n >= 1_000_000` (and < B threshold) → output ends with `M`
- `n >= 1_000` (and < M threshold) → output ends with `K`
- `n < 1_000` → no suffix, two decimal places

Additionally, the numeric portion must be formatted to exactly one decimal place for abbreviated values.

**Validates: Requirements 3.3**

---

### Property 7: Null or undefined stat values render em dash

*For any* stat field that is `null` or `undefined`, `formatCompact(null)` and `formatCompact(undefined)` must both return the string `'—'`, and the corresponding `StatCard` must display `'—'` rather than any numeric value or empty string.

**Validates: Requirements 3.5**

---

### Property 8: OHLC tooltip formatter produces all four labelled values

*For any* OHLC data point `{open, high, low, close}` with positive numeric values, the custom ApexCharts tooltip function must produce a string that contains all four labels (`O:`, `H:`, `L:`, `C:`) each followed by a dollar-formatted value with at least two decimal places.

**Validates: Requirements 5.5**

---

### Property 9: Trade estimate calculation correctness

*For any* valid positive `amount` (number) and positive `price` (number):
- When `type === 'buy'`: the displayed estimate equals `amount / price` (quantity of the asset)
- When `type === 'sell'`: the displayed estimate equals `amount * price` (proceeds in account currency)

The result must update synchronously on every `amount` state change (no async step in the calculation itself).

**Validates: Requirements 6.6**

---

### Property 10: Zero or negative amount triggers specific validation message

*For any* numeric value `n` where `n <= 0`, calling the trade validation function with `n` must return (or set) the error message `"Amount must be greater than 0"` and must not proceed to the API call.

**Validates: Requirements 6.7**

---

### Property 11: Non-numeric or empty input triggers specific validation message

*For any* string `s` where `s.trim() === ''` or `parseFloat(s)` is `NaN`, calling the trade validation function with `s` must return (or set) the error message `"Please enter a valid amount"` and must not proceed to the API call.

**Validates: Requirements 6.8**

---

## Error Handling

### Page-level errors

| Condition | Behaviour |
|-----------|-----------|
| `detail.isLoading` | Full-page skeleton: header (4 placeholders) + chart area + stat grid (4 placeholders) + trade panel (2 button placeholders) |
| `!detail.data` (null or fetch error) | "Asset not found" message + `<Link href="/market">← Back to market</Link>` |

### Chart-area errors (isolated — rest of UI stays interactive)

| Condition | Behaviour |
|-----------|-----------|
| `history.isLoading` | `<Skeleton>` with same height as the chart container |
| `history.isError` | Centered text: "Chart data unavailable" |
| `history.data.length === 0` | Centered text: "No chart data available for this range" |
| Image `onError` | Replace `<img>` with `<span className="...">` showing `item.symbol.toUpperCase()` |

### TradeModal errors

Validation runs synchronously on submit; error text is shown inline beneath the input field. No toast is shown for validation errors (only for network failures during trade execution).

---

## Testing Strategy

### Unit / Example-Based Tests

These cover specific states and interactions that are not suitable for property-based testing:

- Renders exactly 6 range pills with correct labels
- Defaults to `7D` selected on initial render
- Skeleton renders when `detail.isLoading`
- "Asset not found" + back link renders when `detail.data` is null
- Chart skeleton replaces chart while `history.isLoading`
- "Chart data unavailable" renders when `history.isError`
- "No chart data available for this range" renders when history returns `[]`
- Image onError triggers fallback
- TradeModal opens with correct `type` and pre-populated `100`
- Estimated quantity/proceeds label is present in the modal

### Property-Based Tests

Property-based testing is appropriate here because the feature contains several pure helper functions and mapping tables with well-defined universal properties. Use **fast-check** (TypeScript/JavaScript PBT library).

Minimum 100 iterations per property test.

Tag format: `Feature: single-market-view-ui-ux, Property N: <property text>`

| Property | fast-check Generators |
|----------|-----------------------|
| P1: Range→days mapping | `fc.constantFrom('1H','24H','7D','1M','3M','1Y')` |
| P2: One active pill at a time | `fc.constantFrom` for range + DOM query count |
| P3: Colour class by sign | `fc.float()` (positive and negative ranges) |
| P4: formatPriceChange formatting | `fc.float()` × 2 covering positive, negative, zero |
| P5: StatGrid renders 4 cards | `fc.record(...)` generating valid MarketCoin objects |
| P6: formatCompact magnitude suffixes | `fc.integer({ min: 0, max: 1e15 })` |
| P7: null/undefined → em dash | `fc.constantFrom(null, undefined)` |
| P8: OHLC tooltip labels | `fc.record({ open, high, low, close }: fc.float({ min: 1 }))` |
| P9: Estimate calculation | `fc.float({ min: 0.01 })` × 2 for amount and price |
| P10: Zero/negative validation | `fc.float({ max: 0 })` |
| P11: Non-numeric validation | `fc.string()` filtered to NaN-producing inputs |

### Integration / Snapshot Tests

- ApexCharts options object matches expected structure (dark background, correct colours, grid opacity, axis font size)
- CSS classes for layout (chart container border-radius, Trade Panel `fixed bottom-0`, safe-area padding)
- TanStack Query re-fetches when `selectedRange` changes (mock `getCryptoHistory` and verify call count + args)
