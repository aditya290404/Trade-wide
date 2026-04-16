

# Trade Wide — Premium Fintech Dashboard UI

## Design System
- **Dark theme base** with deep navy (`#0B0F19`) background
- **Accent colors**: Neon blue/purple gradients, green (#22c55e) for profit, red (#ef4444) for loss
- **Glassmorphism**: Semi-transparent cards with backdrop-blur and subtle borders
- **Typography**: Inter font, strong hierarchy with bold headings and muted secondary text
- **Animations**: Fade-in on mount, hover scale/glow on cards, smooth row highlights

## Shared Components
- **MetricCard** — Glassmorphic card with icon, label, value, and optional trend indicator (green/red glow)
- **StockCard** — Holdings card with stock info, P&L color-coding, gradient border, hover lift
- **DataTable** — Styled table with hover row highlight, color-coded cells
- **GlowBadge** — Profit/loss badge with subtle glow effect
- **Layout wrapper** — Dark background, sidebar-ready container with consistent spacing

## Page 1: Trades (`/trades`)
- **Header**: "Trade History" with gradient accent underline
- **Summary row**: 3 MetricCards — Total Trades, Total P&L, Win Rate
- **Trades table**: Glassmorphic container, columns for Stock, Buy/Sell Price, Qty, P&L (color-coded with glow), Date
- Hover row highlight with subtle glow; profit rows get green tint, loss rows get red tint
- Realistic mock data (10+ trades with Indian stocks like RELIANCE, TCS, INFY)

## Page 2: Portfolio (`/portfolio`)
- **Hero section**: Large portfolio value with gradient text, Total P&L and Available Balance as MetricCards
- **Holdings grid**: Responsive card grid using StockCard components
- Each card shows stock name, qty, avg price, current price, P&L with animated color
- **Portfolio chart**: Simple area/line chart showing growth over time using Recharts
- Gradient borders, glow on hover, smooth lift animations

## Global Styling Updates
- Update CSS variables for dark fintech theme
- Add custom keyframe animations (fade-in, glow-pulse, hover-lift)
- Add Inter font import
- Navigation bar with Trade Wide branding, links to /trades and /portfolio

