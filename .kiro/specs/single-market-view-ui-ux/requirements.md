# Requirements Document

## Introduction

This feature upgrades the single market detail page (`/market/crypto/:id`) from a minimal functional layout to a premium, world-class fintech UI/UX on par with Coinbase, Binance, and Robinhood. The upgrade covers: a polished asset header, interactive time-range filtering for the candlestick chart, rich market stat cards, improved trade CTA layout, and a fully mobile-first responsive design — all using the existing design system (Tailwind, design tokens, and existing UI components).

## Glossary

- **DetailPage**: The React page component rendered at `/market/crypto/:id` (currently `CryptoDetailPage` / `Detail` in `DetailPage.tsx`)
- **Asset_Header**: The section displaying the asset logo, name, symbol, current price, and 24h change
- **Chart**: The candlestick chart rendered via `CandlestickChart` (ApexCharts)
- **Range_Selector**: The set of pill/tab controls that let the user choose a historical time range for the Chart
- **Stat_Grid**: The grid of market statistic cards (market cap, 24h volume, 24h high, 24h low)
- **Trade_Panel**: The sticky bottom area containing Buy and Sell action buttons
- **TradeModal**: The modal dialog for entering a trade amount and confirming a buy or sell order
- **Skeleton_Screen**: The placeholder loading state rendered while data is being fetched
- **Range_Option**: A single selectable time-range value: `1H`, `24H`, `7D`, `1M`, `3M`, or `1Y`
- **API**: The `marketApi` object exposed by `market.api.ts`
- **Design_System**: The tokens defined in `design.ts` and the Tailwind utility classes used across the frontend

---

## Requirements

### Requirement 1: Time-Range Selector for Chart

**User Story:** As a trader, I want to filter the price chart by a specific time range, so that I can analyse short-term and long-term price movements without leaving the page.

#### Acceptance Criteria

1. THE DetailPage SHALL render a Range_Selector containing exactly six Range_Option pills: `1H`, `24H`, `7D`, `1M`, `3M`, and `1Y`.
2. WHEN the user selects a Range_Option, THE DetailPage SHALL update the Chart to display historical data corresponding to that range.
3. WHEN the user selects a Range_Option, THE Range_Selector SHALL visually distinguish the selected pill from unselected pills (e.g. by background colour, font weight, or border), and only one pill SHALL be in the selected state at a time.
4. THE DetailPage SHALL default to the `7D` Range_Option on initial load.
5. WHEN the user selects a Range_Option, THE DetailPage SHALL call `marketApi.getCryptoHistory` with the `days` argument mapped as: `1H → 1`, `24H → 1`, `7D → 7`, `1M → 30`, `3M → 90`, `1Y → 365`.
6. WHEN the user selects the `1H` or `24H` Range_Option, THE DetailPage SHALL pass `interval: '1h'` to the history query; for all other Range_Options THE DetailPage SHALL pass `interval: '1d'`.
7. WHILE history data is loading — whether on initial page load or after the user selects a new Range_Option — THE DetailPage SHALL render a chart-area Skeleton_Screen of the same height as the Chart in place of the Chart.
8. IF the history API returns an empty array for a selected range, THE DetailPage SHALL display the message "No chart data available for this range" centered within the chart area.
9. IF the history API request fails for a selected range, THE DetailPage SHALL display the message "Chart data unavailable" within the chart area, and the Range_Selector SHALL continue to show the previously selected Range_Option as active.

---

### Requirement 2: Premium Asset Header

**User Story:** As a user, I want to see a polished, information-rich header for the asset I am viewing, so that I can quickly orient myself and feel confident in the data quality.

#### Acceptance Criteria

1. THE Asset_Header SHALL display the asset logo, full name, ticker symbol, current price, and 24h percentage change on every render.
2. WHEN the 24h change is zero or positive, THE Asset_Header SHALL render the change value and an upward-trending icon using the Design_System's `primary` colour token.
3. WHEN the 24h change is negative, THE Asset_Header SHALL render the change value and a downward-trending icon using the Design_System's `destructive` colour token.
4. THE Asset_Header SHALL render the current price in a monospaced font at no smaller than 36 px on all viewports.
5. THE Asset_Header SHALL display the absolute 24h price change (formatted to exactly two decimal places, prefixed with `+` or `-`) and the percentage change (formatted to exactly two decimal places, prefixed with `+` or `-`) side by side (e.g. `+$124.50  +2.34%`); when the absolute change is zero, the prefix SHALL be `+`.
6. WHILE asset detail data is loading, THE Asset_Header SHALL render a Skeleton_Screen containing four distinct placeholders: a circular logo placeholder (48 × 48 px), a name-text placeholder, a price-text placeholder, and a change-text placeholder.
7. IF the asset logo image fails to load, THE Asset_Header SHALL display a fallback element (either the ticker symbol in uppercase or a generic asset icon) in place of the broken image.

---

### Requirement 3: Market Statistics Grid

**User Story:** As a trader, I want to see key market statistics at a glance, so that I can make informed trading decisions without navigating away.

#### Acceptance Criteria

1. IF asset detail data is available, THE Stat_Grid SHALL display the following four statistics: Market Cap, 24h Volume, 24h High, and 24h Low.
2. THE Stat_Grid SHALL arrange the four statistics in a 2-column grid on viewports narrower than 640 px and in a 4-column grid on viewports 640 px and wider.
3. THE Stat_Grid SHALL format Market Cap and 24h Volume using compact notation with the following thresholds and one decimal place: values ≥ 1,000,000,000,000 as `T`, values ≥ 1,000,000,000 as `B`, values ≥ 1,000,000 as `M`, values ≥ 1,000 as `K`, smaller values unabbreviated (e.g. `$1.2B`, `$340.5M`).
4. THE Stat_Grid SHALL format 24h High and 24h Low as currency values with exactly two decimal places (e.g. `$67,432.10`).
5. IF an individual statistic value is unavailable (null or undefined), THE Stat_Grid SHALL render `—` (em dash) in place of that statistic's value.

---

### Requirement 4: Responsive Mobile-First Layout

**User Story:** As a mobile user, I want the detail page to be easy to read and use on a small screen, so that I can trade on the go without pinching or horizontal scrolling.

#### Acceptance Criteria

1. THE DetailPage SHALL use a single-column layout on viewports narrower than 640 px with no horizontal overflow.
2. THE DetailPage SHALL expand to a centred, max-width-constrained layout (maximum 768 px) on viewports 640 px and wider.
3. THE Trade_Panel SHALL be rendered as a sticky bar fixed to the bottom of the viewport on all viewport sizes, with bottom padding equal to `max(env(safe-area-inset-bottom), 0px)` so content is not obscured by device home indicators.
4. THE Chart SHALL scale to 100% of the available container width on all viewport sizes.
5. THE Chart SHALL render at a minimum height of 260 px on viewports narrower than 640 px and at a minimum height of 360 px on viewports 640 px and wider.
6. THE Range_Selector SHALL display all six Range_Option pills in a single scrollable horizontal row on viewports narrower than 400 px with no line-wrapping; on viewports 400 px and wider the pills MAY wrap across multiple rows or remain in a single row.

---

### Requirement 5: Premium Chart Visual Design

**User Story:** As a user, I want the price chart to look polished and professional, so that the app feels like a world-class fintech product.

#### Acceptance Criteria

1. THE Chart SHALL be contained within a card with a dark background (minimum contrast ratio of 2:1 against the page background) that visually separates it from the surrounding page.
2. THE Chart SHALL render upward candles in the Design_System `primary` colour and downward candles in the Design_System `destructive` colour, with wick colours matching their respective candle fill colours.
3. THE Chart SHALL display grid lines with an opacity no greater than 0.08 on both axes.
4. THE Chart SHALL render x-axis and y-axis tick labels in the Design_System `mutedForeground` colour at a font size of 11 px or smaller.
5. WHEN the user hovers over (desktop) or taps (mobile) a candle, THE Chart SHALL display a tooltip containing: the candle's date and time formatted as `DD MMM YYYY HH:mm`, and the four OHLC values each labelled (e.g. `O: $67,400.00`, `H: $68,200.00`, `L: $66,800.00`, `C: $67,900.00`).
6. WHEN chart data finishes loading (either on initial render or after a range change), THE Chart SHALL transition from hidden to fully visible over a duration of no more than 400 ms using a CSS opacity or transform animation; THE Chart SHALL not display this animation while data is still loading.
7. THE Chart container SHALL have a border-radius of at least 16 px.

---

### Requirement 6: Sticky Trade Panel and Trade Modal Improvements

**User Story:** As a trader, I want the Buy and Sell actions to always be accessible and the trade flow to feel premium, so that I can execute trades quickly and confidently.

#### Acceptance Criteria

1. THE Trade_Panel SHALL always be visible without scrolling on all viewport sizes by being fixed to the bottom of the viewport.
2. THE Trade_Panel SHALL render a Buy button styled with the Design_System `primary` colour and a Sell button styled with the Design_System `destructive` colour, each occupying equal width.
3. THE Trade_Panel SHALL display the current asset price formatted as a currency value with at least two decimal places above the Buy and Sell buttons.
4. WHEN the user taps the Buy button, THE TradeModal SHALL open with `type` set to `buy` and the amount field pre-populated with `100` in the account's currency.
5. WHEN the user taps the Sell button, THE TradeModal SHALL open with `type` set to `sell` and the amount field pre-populated with `100` in the account's currency.
6. THE TradeModal SHALL display, beneath the amount input, the estimated quantity (for buy: `amount ÷ price` units of the asset) or estimated proceeds (for sell: `amount × price` in the account currency), updating within 300 milliseconds of the user's last keystroke.
7. IF the user submits the TradeModal with a zero or negative amount, THE TradeModal SHALL display the inline validation message "Amount must be greater than 0" without closing the modal.
8. IF the user submits the TradeModal with an empty or non-numeric amount, THE TradeModal SHALL display the inline validation message "Please enter a valid amount" without closing the modal.

---

### Requirement 7: Loading and Error States

**User Story:** As a user, I want clear feedback when data is loading or unavailable, so that I am never left staring at a blank screen.

#### Acceptance Criteria

1. WHILE the asset detail query is in a loading state, THE DetailPage SHALL render a full Skeleton_Screen composed of four sections: an Asset_Header skeleton (logo, name, price, and change placeholders), a Chart-area skeleton, a Stat_Grid skeleton (four stat-card placeholders), and a Trade_Panel skeleton (two button placeholders).
2. IF the asset detail query returns null or fails, THE DetailPage SHALL display the message "Asset not found" and a back-navigation link that returns the user to the market list page.
3. IF the history query fails, THE DetailPage SHALL display the message "Chart data unavailable" within the chart area; the Asset_Header, Stat_Grid, and Trade_Panel SHALL remain visible and fully interactive.
