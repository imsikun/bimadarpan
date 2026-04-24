# BimaDarpan — Design System
**Aurora UI + Saffron Identity**
Version 2.0 | For use with Claude Code

---

## Design Philosophy

**One sentence:** An intelligent cockpit, not a dashboard.

BimaDarpan feels alive. Data breathes. The map glows. Insights surface before you ask. The visual language is dark, futuristic, and unmistakably Indian — aurora gradients behind every surface, saffron (#FF9933) used as a precision instrument, not decoration.

**Reference aesthetic:** Aurora UI — dark background, animated mesh gradient (purple, blue, teal), semi-transparent cards, expressive motion. Saffron accent ties every interaction to India.

**The one thing users will remember:** A glowing India map that lights up in orange-gold wherever insurance is strong, and stays dark where people are unprotected. That image is the product.

---

## Color System

### Background Palette

```css
--bg-base:        #080810;   /* Deepest background — near black with blue tint */
--bg-surface:     #0D0D1F;   /* Primary surface — cards, panels */
--bg-elevated:    #12122A;   /* Elevated elements — modals, tooltips, dropdowns */
--bg-data:        #111128;   /* Data cards — slightly lighter so numbers pop */
--bg-overlay:     rgba(255, 255, 255, 0.04);  /* Glass card fill */
--bg-overlay-md:  rgba(255, 255, 255, 0.07);  /* Glass card hover */
--bg-overlay-lg:  rgba(255, 255, 255, 0.10);  /* Glass card active */
```

### Aurora Gradient (Animated Background)

```css
--aurora-gradient: linear-gradient(
  135deg,
  #080818,
  #0D1035,
  #0A1828,
  #120A30,
  #080E20
);
/* background-size: 400% 400%; animation: aurora 15s ease infinite; */
```

**Aurora contrast safety rule:** The aurora gradient shifts between dark phases. Any text placed directly on the aurora background must sit inside a container with `background: rgba(0,0,0,0.35)` minimum. Never place bare text on the raw aurora without this backing.

### Accent — Saffron (Primary)

```css
--saffron:        #FF9933;   /* Primary accent — used sparingly and with intent */
--saffron-dim:    rgba(255, 153, 51, 0.15);  /* Saffron background tint */
--saffron-border: rgba(255, 153, 51, 0.25);  /* Saffron border */
--saffron-glow:   rgba(255, 153, 51, 0.12);  /* Map glow, hover states */
```

### Supporting Accents

```css
--teal:           #00D4AA;   /* Live indicator, positive data, good settlement ratios */
--teal-dim:       rgba(0, 212, 170, 0.12);
--purple:         #7C6FFF;   /* Secondary accent — charts, secondary highlights */
--purple-dim:     rgba(124, 111, 255, 0.12);
--red-alert:      #FF4757;   /* Negative data — low penetration, bad claim ratios */
--red-dim:        rgba(255, 71, 87, 0.12);
```

### Text Hierarchy

```css
--text-primary:   #FFFFFF;                    /* Headlines, key numbers */
--text-secondary: rgba(255,255,255,0.70);     /* Body text, labels */
--text-tertiary:  rgba(255,255,255,0.40);     /* Hints, placeholders, metadata */
--text-muted:     rgba(255,255,255,0.20);     /* Disabled, decorative */
--text-saffron:   #FF9933;                    /* Accent text — use sparingly */
--text-teal:      #00D4AA;                    /* Positive, live, success states */
--text-red:       #FF6B7A;                    /* Negative, alert states */
```

### Border System

```css
--border-subtle:  rgba(255, 255, 255, 0.06);  /* Default card borders */
--border-default: rgba(255, 255, 255, 0.10);  /* Active card borders */
--border-strong:  rgba(255, 255, 255, 0.18);  /* Focused input borders */
--border-saffron: rgba(255, 153, 51, 0.30);   /* Selected state borders */
```

### Map Color Scale (Insurance Penetration)

Darker = worse, brighter = better. This heatmap logic is used on both the map and in data panels — one visual language throughout.

```css
--map-critical:   #0D0A2A;   /* < 10% penetration */
--map-low:        #1E1260;   /* 10–15% */
--map-low-mid:    #2A1A7A;   /* 15–20% */
--map-mid:        #3D2090;   /* 20–25% */
--map-mid-high:   #5530B0;   /* 25–30% */
--map-high:       #7040C8;   /* 30–35% */
--map-top:        #FF9933;   /* 35%+ — saffron, fully lit */
--map-stroke:           rgba(255, 153, 51, 0.20);
--map-stroke-selected:  rgba(255, 153, 51, 0.70);
```

### Data Signal Colors (Heatmap Intensity System)

Data quality is communicated through intensity — matching map logic. No traffic lights.

```css
--data-excellent: #FF9933;               /* Top tier — saffron, matches map-top */
--data-good:      #00D4AA;               /* Above average — teal */
--data-warning:   #EF9F27;              /* Below average — amber */
--data-poor:      #FF4757;               /* Critical underperformance */
--data-critical:  rgba(255, 71, 87, 0.60);  /* Worst tier — dimmed red */
```

**Icon pairing rules (Lucide, strokeWidth 1.5):**

| Signal | Color | Icon |
|---|---|---|
| Excellent | `--data-excellent` | `ShieldCheck` |
| Good | `--data-good` | `Shield` |
| Warning | `--data-warning` | `AlertTriangle` |
| Poor | `--data-poor` | `ShieldX` |
| Critical | `--data-critical` | `ShieldX` |

---

## Typography

### Font Stack

```css
--font-display: 'Clash Display', 'DM Sans', system-ui, sans-serif;
--font-body:    'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', 'Fira Code', monospace;
```

**Load fonts (free):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet">
```

### Type Scale

```css
--text-xs:   11px;  /* line-height: 1.4 — badges, timestamps, metadata */
--text-sm:   13px;  /* line-height: 1.5 — secondary labels, descriptions */
--text-base: 15px;  /* line-height: 1.6 — body text, card content */
--text-md:   18px;  /* line-height: 1.5 — section headings */
--text-lg:   24px;  /* line-height: 1.3 — page headings */
--text-xl:   32px;  /* line-height: 1.2 — hero numbers, stat values */
--text-2xl:  48px;  /* line-height: 1.1 — hero headline */
--text-3xl:  64px;  /* line-height: 1.0 — landing hero only */
```

### Font Weight Conventions

```
300 — thin decorative (use rarely)
400 — body, descriptions, secondary content
500 — labels, nav items, most UI text
600 — headings, important values, CTA text
700 — hero numbers, display text only
```

---

## Spacing System

Base unit: 4px

```css
--space-1:  4px;   --space-2:  8px;   --space-3:  12px;
--space-4:  16px;  --space-5:  20px;  --space-6:  24px;
--space-8:  32px;  --space-10: 40px;  --space-12: 48px;
--space-16: 64px;  --space-20: 80px;
```

**Padding conventions:**
- Glass cards: 16px 20px (mobile: 12px 16px)
- Data metric cards: 14px 16px — tighter for information density
- Section containers: 20px 24px
- Page max-width: 1440px, centered
- Sidebar width: 320px fixed

---

## Border Radius

```css
--radius-sm:   6px;     /* Badges, pills, small chips */
--radius-md:   10px;    /* Inputs, small cards */
--radius-lg:   14px;    /* Standard cards, panels */
--radius-xl:   20px;    /* Large panels, bottom sheet, modals */
--radius-full: 9999px;  /* Circular elements, full pills */
```

---

## Glass Card System

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.12);
}

.glass-card--selected {
  border-color: rgba(255, 153, 51, 0.40);
  background: rgba(255, 153, 51, 0.06);
}

.glass-card--elevated {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
}
```

**Low-end device handling — disable backdrop-filter via JS capability check:**

```javascript
// In root layout — add class to disable blur on weak hardware
const isLowEnd = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 2;
if (isLowEnd) document.documentElement.classList.add('no-blur');
```

```css
.no-blur .glass-card {
  background: var(--bg-elevated);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
```

---

## Animation System

### Keyframes

```css
@keyframes aurora {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(1.5); }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes number-count {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

@keyframes toast-in  {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

@keyframes toast-out {
  from { opacity: 1; transform: translateY(0)   scale(1); }
  to   { opacity: 0; transform: translateY(-4px) scale(0.98); }
}

@keyframes page-fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Animation Tokens

```css
--dur-fast:    150ms;
--dur-default: 250ms;
--dur-slow:    400ms;
--dur-aurora:  15s;
--dur-ticker:  25s;
--dur-sheet:   320ms;

--ease-default: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
--ease-sheet:   cubic-bezier(0.32, 0.72, 0, 1);
```

### When to Animate

| Element | Animation | Duration |
|---|---|---|
| Aurora background | Continuous loop | 15s |
| State panel update | `slide-in-right` | 250ms |
| Map state hover | Fill color transition | 150ms |
| Map state click | Panel slides in from right | 250ms |
| Live dot | `pulse-live` | 2s loop |
| News ticker | `ticker-scroll` | 25s loop |
| Quiz question change | `fade-up` | 250ms |
| Score reveal | `number-count` + count-up JS | 800ms |
| Page entry | `page-fade` | 300ms |
| Toast in / out | `toast-in` / `toast-out` | 200ms / 150ms |
| Bottom sheet open | `slide-up` | 320ms ease-sheet |
| Bottom sheet close | Reverse `slide-up` | 280ms ease-smooth |
| Skeleton shimmer | `shimmer` loop | 1.5s |
| Bar chart bars | Width 0 → value | 500ms ease-smooth, 50ms stagger per row |

### Page Transitions

Next.js App Router does not animate between routes by default. Add this to every page's root element:

```css
.page-enter { animation: page-fade 300ms var(--ease-default) both; }
```

```tsx
// Every app/*/page.tsx
<main className="page-enter">...</main>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .aurora-bg    { animation: none; }
  .pulse-live   { animation: none; }
  .ticker-inner { animation: none; overflow-x: scroll; }
  .skeleton     { animation: none; opacity: 0.4; }
  *             { transition-duration: 0.01ms !important;
                  animation-duration:  0.01ms !important; }
}
```

---

## Layout Architecture

### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ TOPNAV (64px fixed)                                     │
├─────────────────────────────────────────────────────────┤
│ LIVE TICKER (36px)                                      │
├──────────────────────────────────┬──────────────────────┤
│                                  │                      │
│   MAP PANEL                      │   SIDEBAR (320px)    │
│   (fills remaining width)        │   fixed right        │
│                                  │                      │
│                                  │                      │
├──────────────────────────────────┴──────────────────────┤
│ FOOTER (48px)                                           │
└─────────────────────────────────────────────────────────┘
```

### Topnav (64px)

```
[Logo + Wordmark]    [Map] [Quiz] [Health Check] [Leaderboard] [News]    [Live indicator]
```

- Background: `rgba(8,8,16,0.90)` + `backdrop-filter: blur(20px)`
- Border-bottom: `1px solid rgba(255,255,255,0.06)`
- `position: fixed`, `z-index: 100`
- Logo: 32×32px saffron gradient icon + "BimaDarpan" in Clash Display 600
- Nav items: DM Sans 500 13px, `--text-tertiary` default, `--text-saffron` active
- Active state: saffron text + `rgba(255,153,51,0.10)` pill background
- Live indicator: 6px teal pulsing dot + "Live" teal 11px 600

### Live Ticker (36px)

- Background: `rgba(255,255,255,0.02)`, border-bottom `rgba(255,255,255,0.05)`
- Text: 11px DM Sans 400, `--text-tertiary`, separator: saffron diamond `◆`
- Content duplicated for seamless loop
- **Desktop pause on hover:** `animation-play-state: paused`
- **On mouse-leave:** resumes from current position — do not snap back
- **Touch devices:** no pause, ticker runs continuously

### Sidebar (320px, fixed right)

Stacked sections, dividers `1px solid rgba(255,255,255,0.06)`:

1. National snapshot — 4 cards in 2×2 grid
2. State detail panel — animates in from right on state select
3. Leaderboard preview — top 5 + bottom 1
4. AI query bar + suggestion chips
5. Health check CTA — always visible at bottom

---

## Mobile Layout (< 768px)

### General

- Topnav: logo + hamburger only
- Ticker: full width, continuous
- Map: full screen height minus topnav + ticker
- Sidebar → bottom sheet
- Quiz / health check: full screen, one step per screen

### Bottom Sheet — Full Specification

**Three snap points:**

```
Collapsed:  translateY(100%)                  — off screen
Peek:       translateY(calc(100% - 120px))    — 120px visible: state name + penetration
Half:       translateY(30%)                   — 70% of screen: full state panel
Full:       translateY(0)                     — 100% height, scrollable, all sections
```

**Snap logic:**
- Tap a state → opens to Peek automatically
- Drag up past midpoint between Peek and Half → snaps to Half
- Drag up past midpoint between Half and Full → snaps to Full
- Drag down past midpoint between any two → snaps to lower
- Drag down from Peek by > 60px → dismisses (Collapsed)

**Visual anatomy:**
```
┌──────────────────────────────────────────┐
│   ░░░░░░░░  drag handle (40×4px, rounded)│
│                                          │
│   Maharashtra              31.2%         │  ← peek content
│   ───────────────────────────────────    │
│   [state panel content]                  │  ← half content
│   [leaderboard preview]                  │
│   [AI query bar]                         │  ← full content
│   [health check CTA]                     │
└──────────────────────────────────────────┘
```

**CSS:**

```css
.bottom-sheet {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 200;
  background: var(--bg-surface);
  border-top: 1px solid rgba(255,255,255,0.10);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  transform: translateY(100%);
  transition: transform var(--dur-sheet) var(--ease-sheet);
  max-height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.bottom-sheet.peek  { transform: translateY(calc(100% - 120px)); }
.bottom-sheet.half  { transform: translateY(30%); }
.bottom-sheet.full  { transform: translateY(0); }

.bottom-sheet__handle {
  width: 40px; height: 4px;
  background: rgba(255,255,255,0.20);
  border-radius: 2px;
  margin: 12px auto 16px;
}

.sheet-backdrop {
  position: fixed; inset: 0; z-index: 199;
  background: rgba(0,0,0,0);
  pointer-events: none;
  transition: background var(--dur-default);
}
.sheet-backdrop.active {
  background: rgba(0,0,0,0.40);
  pointer-events: all;
}
```

**Keyboard on mobile:** When AI query input is focused, the sheet stays at Half — it does not push up. Use `env(safe-area-inset-bottom)` padding on the bottom CTA. `overscroll-behavior: contain` prevents sheet scroll propagating to the map.

---

## Data Component Specifications

### Design Approach

All data surfaces use `--bg-data` (#111128) — slightly lighter than surface so numbers stand out against the aurora background. Heatmap intensity communicates data quality consistently with the map. Every metric carries an icon for at-a-glance signal.

---

### State Panel Metric Card

Used in: sidebar state detail, state SEO pages.

```
┌───────────────────────────────────┐
│ [Icon 20px]                       │
│                                   │
│ 31.2%                             │  value: 28px JetBrains Mono 600, signal color
│ Insurance penetration             │  label: 11px DM Sans 400, --text-tertiary
│                                   │
│ ████████████████░░░░░             │  progress bar: 4px, signal color fill
└───────────────────────────────────┘
```

**Signal rules per metric:**

| Metric | Excellent | Good | Warning | Poor |
|---|---|---|---|---|
| Penetration % | >30% saffron ShieldCheck | 20–30% teal Shield | 10–20% amber AlertTriangle | <10% red ShieldX |
| Settlement % | >95% saffron CheckCircle | 85–95% teal CheckCircle | 70–85% amber AlertTriangle | <70% red XCircle |
| Claim ratio % | >80% teal TrendingUp | 60–80% teal TrendingUp | 40–60% amber AlertTriangle | <40% red TrendingDown |

**Progress bar:** fill color = signal color at 80% opacity. Track = `rgba(255,255,255,0.08)`. Width = `(value / metric_max) * 100%`. Animate width from 0 on panel enter — 600ms ease-smooth.

```css
.metric-card {
  background: var(--bg-data);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}

.metric-card__icon   { color: var(--signal-color); }  /* set via inline style */
.metric-card__value  {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin: 8px 0 4px;
  color: var(--signal-color);
}
.metric-card__label  { font-size: 11px; color: var(--text-tertiary); }
.metric-card__track  {
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}
.metric-card__fill   {
  height: 100%;
  border-radius: 2px;
  background: var(--signal-color);
  opacity: 0.8;
  transition: width 600ms var(--ease-smooth);
}
```

**State panel grid:** 2×2 grid, `gap: 10px`. Cards: penetration %, settlement ratio %, top insurer (text only, no bar), majority category (badge only).

---

### National Snapshot Cards (Sidebar top)

4 cards in 2×2 grid, summary only — no progress bar, no icon.

```css
.snapshot-card {
  background: var(--bg-data);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,0.07);
}
.snapshot-card__value {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 600;
  color: var(--saffron);
  line-height: 1;
}
.snapshot-card__label {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 4px;
}
```

---

### Horizontal Bar Chart (Leaderboard + State Comparison)

```
Maharashtra  ████████████████████████░░░  31.2%
Kerala       ████████████████████░░░░░░░  27.3%
Bihar        ████░░░░░░░░░░░░░░░░░░░░░░░   9.8%
```

- Row height: 36px
- Bar height: 6px, vertically centered
- Bar max-width: fills to 100% column. 100% = highest value in current set
- Bar fill: signal color (heatmap rules above)
- State name: 13px DM Sans 500, `--text-secondary`, left
- Value: 12px JetBrains Mono, right-aligned, signal color
- Row hover: `rgba(255,255,255,0.03)` bg + saffron 3px left border
- Bar animation: width 0 → value, 500ms ease-smooth, 50ms stagger per row

```css
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border-left: 3px solid transparent;
  transition: all var(--dur-fast);
  cursor: pointer;
}
.bar-row:hover { background: rgba(255,255,255,0.03); border-left-color: var(--saffron); }

.bar-track {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 500ms var(--ease-smooth);
}
```

---

## Loading & Skeleton States

### Shimmer — Shared Base

```css
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.06);
  border-radius: var(--radius-sm);
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.06) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

Minimum visible time: 400ms. Use a `useMinimumDelay(400)` hook to avoid skeleton flash on fast connections.

### Map Loading

- All state paths: `fill: #1A1A3A`, `stroke: rgba(255,255,255,0.05)`
- Map controls: visible but `opacity: 0.4`, `pointer-events: none`
- Sidebar: national snapshot cards render as skeletons

### Sidebar State Panel Skeleton

```
[skeleton 16px tall]              ← state name
[skeleton 72px] [skeleton 72px]   ← metric card row 1
[skeleton 72px] [skeleton 72px]   ← metric card row 2
```

### News Card Skeleton

```
[badge skeleton 40×18px]
[headline skeleton 2 lines, 14px each]
[summary skeleton 1 line, 12px]
[timestamp skeleton 60px wide]
```

### Leaderboard Skeleton

8 full-width row skeletons, 36px tall each. Show while data loads.

---

## Empty States

Every empty state: icon (32px, `rgba(255,255,255,0.20)`) + headline (15px DM Sans 500, `--text-secondary`) + sub-line (13px DM Sans 400, `--text-tertiary`). Never blank, never raw "No data".

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 24px;
  text-align: center;
}
```

**Specific empty states:**

**Map — no state selected (initial load):**
Icon: `MapPin` | "Select a state to explore" | "Click any state on the map to see its data"

**News feed — no results for filter:**
Icon: `Newspaper` | "No news in this category yet" | "Try switching to All or check back later"
+ Ghost button: "Show all news"

**Leaderboard — data unavailable:**
Icon: `BarChart2` | "Leaderboard is updating" | "FY25 data is being processed. Check back shortly."

**Quiz — question bank empty (should not happen, handle defensively):**
Icon: `HelpCircle` | "Quiz is being prepared" | "Questions are loading. Please try again in a moment."

**State panel — no data for this state:**
Icon: `Database` | "Data not yet available for [State Name]" | "IRDAI FY25 data for this state hasn't been published. We'll update this as soon as it's released."

---

## Error States

Three severity levels — never alarming, always actionable:

| Level | Use case | Color | Icon |
|---|---|---|---|
| Info | Expected gap, data pending | `--text-tertiary` | `Info` |
| Warning | Partial failure, degraded data | `#EF9F27` amber | `AlertTriangle` |
| Critical | API down, full page failure | `--red-alert` | `AlertCircle` |

### Inline Error (component-level failure)

Used when one section fails while the rest of the page works:

```css
.error-inline {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 71, 87, 0.08);
  border: 1px solid rgba(255, 71, 87, 0.20);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
}
```

Layout: `[AlertCircle 16px red]  Failed to load [X].  [Retry — ghost button small]`

`role="alert"` on the container so screen readers announce it.

### Full Page Error

```
[aurora background visible]
[AlertCircle 48px red, centered]
Something went wrong
We couldn't load this page. The data pipeline may be restarting.
[Primary button: Try again]   [Ghost button: Go to homepage]
```

Centered, max-width 400px, vertically centered in viewport.

### Health Check API Failure

Store `HealthCheckAnswers` in `sessionStorage` before the API call — never lose the user's answers.

```
[AlertTriangle 32px amber]
Analysis is taking longer than expected
Your answers are saved. Try again in a moment.
[Primary button: Retry analysis]   [Ghost button: Start over]
```

### Toast Notification System

Bottom-right desktop, bottom-center mobile. Maximum 1 visible. Auto-dismiss 4 seconds. Manual × dismiss.

```css
.toast-container {
  position: fixed;
  bottom: 24px; right: 24px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@media (max-width: 768px) {
  .toast-container { right: 16px; left: 16px; bottom: 16px; }
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.40);
  animation: toast-in 200ms var(--ease-default) both;
}
.toast.dismissing { animation: toast-out 150ms var(--ease-smooth) both; }

/* 3px left accent bar per type */
.toast--success { border-left: 3px solid var(--teal); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.toast--error   { border-left: 3px solid var(--red-alert); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.toast--info    { border-left: 3px solid var(--purple); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
```

`aria-live="assertive"` on error toasts, `aria-live="polite"` on success/info.

**Toast triggers:**

| Event | Type | Message |
|---|---|---|
| Shareable card ready | success | "Card ready — tap to share" |
| Health check complete | success | "Your coverage report is ready" |
| News feed refreshed | info | "Feed updated with latest news" |
| Non-critical API error | error | "Couldn't refresh data. Retrying..." |
| Quiz completed | success | "Share your result" |

---

## Component Specifications

### Badge / Pill

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.badge--saffron { background: rgba(255,153,51,0.15);  color: #FF9933; border: 1px solid rgba(255,153,51,0.25); }
.badge--teal    { background: rgba(0,212,170,0.12);   color: #00D4AA; border: 1px solid rgba(0,212,170,0.20); }
.badge--purple  { background: rgba(124,111,255,0.12); color: #A89CFF; border: 1px solid rgba(124,111,255,0.20); }
.badge--red     { background: rgba(255,71,87,0.12);   color: #FF6B7A; border: 1px solid rgba(255,71,87,0.20); }
.badge--neutral { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.10); }
```

### Primary Button (Saffron)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #FF9933;
  color: #000;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-default);
  outline: none;
}
.btn-primary:hover         { background: #FFB347; transform: translateY(-1px); }
.btn-primary:active        { background: #E8891E; transform: scale(0.98); }
.btn-primary:focus-visible { box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--saffron); }
.btn-primary:disabled      { background: rgba(255,153,51,0.30); color: rgba(0,0,0,0.40); cursor: not-allowed; transform: none; }
```

### Ghost Button

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  font-weight: 500;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-default);
  outline: none;
}
.btn-ghost:hover         { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.20); }
.btn-ghost:focus-visible { box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px rgba(255,255,255,0.40); }
.btn-ghost:disabled      { opacity: 0.35; cursor: not-allowed; }
```

### Focus Visible — Global Rule

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--saffron);
  border-radius: var(--radius-sm);
}
/* Map SVG paths — keyboard navigation */
.map-state:focus-visible path {
  stroke: var(--saffron) !important;
  stroke-width: 2px !important;
}
```

### AI Query Input

```css
.ai-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: var(--radius-md);
  transition: border-color var(--dur-fast);
}
.ai-input-wrap:focus-within {
  border-color: rgba(255,153,51,0.40);
  background: rgba(255,153,51,0.04);
}
.ai-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}
.ai-input::placeholder { color: rgba(255,255,255,0.25); }

.ai-send-btn {
  width: 28px; height: 28px;
  background: #FF9933;
  border: none;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background var(--dur-fast);
  outline: none;
}
.ai-send-btn:hover         { background: #FFB347; }
.ai-send-btn:focus-visible { box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--saffron); }
.ai-send-btn:disabled      { background: rgba(255,153,51,0.30); cursor: not-allowed; }
```

### Live Indicator

```css
.live-indicator { display: flex; align-items: center; gap: 6px; }
.live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00D4AA;
  animation: pulse-live 2s ease-in-out infinite;
}
.live-text { font-size: 11px; font-weight: 600; color: #00D4AA; letter-spacing: 0.5px; }
```

### Suggestion Chips

```css
.chip {
  display: inline-block;
  padding: 4px 10px;
  border: 1px solid rgba(255,153,51,0.20);
  border-radius: var(--radius-full);
  font-size: 11px;
  color: rgba(255,153,51,0.70);
  cursor: pointer;
  transition: all var(--dur-fast);
  outline: none;
}
.chip:hover         { background: rgba(255,153,51,0.10); color: #FF9933; border-color: rgba(255,153,51,0.40); }
.chip:focus-visible { box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--saffron); }
```

---

## Map Design Specifications

### India TopoJSON Sources

Primary: `https://cdn.jsdelivr.net/npm/india-topo-json/india-states.json`
Fallback: `https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json`

Web-fetch the file before building to confirm feature IDs match state slugs in Supabase.

### D3.js Map Setup

```javascript
const projection = d3.geoMercator()
  .center([82.8, 22.5])
  .scale(1100)
  .translate([width / 2, height / 2]);

const colorScale = d3.scaleThreshold()
  .domain([10, 15, 20, 25, 30, 35])
  .range(['#0D0A2A','#1E1260','#2A1A7A','#3D2090','#5530B0','#7040C8','#FF9933']);
```

### Map Interaction States

| State | Visual treatment |
|---|---|
| Loading | `fill: #1A1A3A`, shimmer SVG rect overlay |
| Default | `colorScale(penetration%)`, stroke `rgba(255,153,51,0.15)` 0.5px |
| Hover | `brightness(1.2)`, stroke `rgba(255,153,51,0.40)` 1px, cursor pointer |
| Selected | Stroke `rgba(255,153,51,0.80)` 2px, scale(1.02), panel updates |
| No data | `#0F0F20`, dashed stroke `rgba(255,255,255,0.10)`, tooltip: "Data pending" |
| Keyboard focus | Stroke `var(--saffron)` 2px solid |

### Map Keyboard Navigation

```tsx
<path
  tabIndex={0}
  aria-label={`${state.name} — ${penetration}% insurance penetration`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') onStateSelect(slug);
  }}
/>
```

### Map Controls (floating, bottom-left)

Layer toggle — one active at a time:
```
[Penetration]  [Premium]  [Claim ratio]  [Top insurer]
```

Type filter:
```
[All]  [Life]  [Health]  [Motor]  [General]
```

Style: `--bg-data` bg, `--radius-full` pills, 12px DM Sans, saffron active.

---

## Page-specific Layouts

### Quiz Page

- Centered single column, max-width 600px
- Progress bar: saffron fill, animated per question
- Question number: `02 / 10` JetBrains Mono, `--text-tertiary`
- `scenario_context`: italic 13px `--text-tertiary`, max 2 lines, above question
- Question: DM Sans 600 20px `--text-primary`
- 4 options: `--bg-data` cards, full width
  - Hover: saffron border
  - Selected: saffron border + `rgba(255,153,51,0.06)` bg
  - Correct: teal border + teal 3px left accent bar
  - Wrong: red border; correct option simultaneously reveals teal border
- Explanation: `fade-up` 250ms after submit
- `shock_stat`: inside explanation, `rgba(255,153,51,0.10)` bg, saffron 2px left border, 12px italic
- Next button: saffron, only appears post-answer; disabled until option selected
- No skipping

### Health Check Page

- Centered single column, max-width 600px
- Progress: 8 step dots — completed=saffron filled, current=saffron outline, upcoming=`rgba(255,255,255,0.15)`
- Inputs: single-select cards, yes/no toggles, number inputs (24px DM Sans, centered, `--bg-data`)
- `sessionStorage` backup on every answer — answers survive API failure
- Result screen: SVG arc score gauge (saffron fill 0 → score%), grade label, has/missing lists, warning block in red-dim with red left border

### Leaderboard Page

- Full-width
- Sortable column headers: click to sort asc/desc, saffron sort arrow
- Top 3 rows: saffron rank + saffron 3px left accent
- Bottom 3 rows: red rank + red 3px left accent + tooltip "why"
- Horizontal bar column: signal color fill, max 160px
- Header: sticky, `--bg-surface` + blur

### News Feed Page

- Desktop: 2-column CSS `column-count: 2`, mobile: single column
- Card: `--bg-data` surface
- Category badge + headline 15px DM Sans 500 + source + timestamp + summary 13px `--text-tertiary`
- Category colors: Regulatory=purple, Claims=teal, Market=saffron, Scandal=red, Government=blue
- Infinite scroll: Intersection Observer on sentinel div
- Category filter: pill group at top, one active, saffron active state

---

## SEO & Metadata (Next.js)

```jsx
export const metadata = {
  title: 'BimaDarpan — India\'s Insurance Intelligence Platform',
  description: 'Explore real-time insurance data across all Indian states. Penetration rates, claim ratios, top insurers, and the truth about India\'s insurance industry.',
  keywords: 'India insurance data, state wise insurance, IRDAI data, insurance penetration India, claim settlement ratio',
  openGraph: {
    title: 'BimaDarpan',
    description: 'India\'s Insurance Intelligence Platform',
    url: 'https://bimadarpan.in',
    siteName: 'BimaDarpan',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

// Dynamic state pages
export async function generateMetadata({ params }) {
  return {
    title: `Insurance in ${params.name} — Penetration, Claims & Data | BimaDarpan`,
    description: `Insurance penetration, claim ratios, top insurers, and coverage data for ${params.name}. Updated from IRDAI FY25 official data.`,
  };
}
```

---

## Iconography

**Lucide React** — `npm install lucide-react`. All icons: `strokeWidth={1.5}`, color inherits.

| Icon | Use |
|---|---|
| `MapPin` | Location, states |
| `TrendingUp` / `TrendingDown` | Leaderboard trends |
| `Shield` / `ShieldCheck` / `ShieldX` | Coverage signal |
| `AlertTriangle` | Warning — low coverage, below average |
| `CheckCircle` / `XCircle` | Claim settlement good/bad |
| `Activity` | Live data |
| `Search` | AI query |
| `Share2` | Shareable cards |
| `ChevronRight` | Drill-down |
| `Info` | Data source tooltip |
| `Database` | Data pending empty state |
| `Newspaper` | News empty state |
| `HelpCircle` | Quiz empty state |
| `AlertCircle` | Critical error |
| `BarChart2` | Leaderboard empty state |

Sizing: 16px inline, 20px standard UI, 24px nav/buttons, 32px empty states, 48px full-page error.

---

## Shareable Card Design (Vercel OG — 1200×630px)

### Quiz result card
- Background: `#080810` static (no animation)
- BimaDarpan wordmark top-left, saffron
- Score: Clash Display 700, saffron, e.g. "7 / 10", centered, large
- Grade: white 24px below score
- `shock_stat` from hardest question answered correctly: muted white 18px italic
- Footer: "Test yourself at bimadarpan.in" saffron 16px

### Health check card
- Same background
- SVG arc gauge, saffron fill from 0 to score%
- Score in saffron: "42 / 100"
- Top gap: "Missing: ₹50L health cover" white 20px
- Footer: "Get your free check at bimadarpan.in" saffron

---

## Accessibility

- `focus-visible`: 2px `--bg-base` gap + 4px saffron ring on all interactive elements
- Map states: `aria-label` state name + penetration %, keyboard navigable via Tab + Enter/Space
- Color never the only signal — always paired with icon (ShieldCheck, AlertTriangle, ShieldX)
- Ticker: `aria-live="polite"`, pauseable via Space key
- All images: `alt` required
- Minimum touch target: 44×44px (map state hit area enlarged beyond visual path)
- All text: WCAG AA contrast minimum on `--bg-base`
- Empty states: `role="status"`
- Error states: `role="alert"`
- Toasts: `aria-live="assertive"` errors, `aria-live="polite"` success/info

---

## CSS Custom Properties — Complete Reference

Paste this entire block into `globals.css`:

```css
:root {
  /* Backgrounds */
  --bg-base:          #080810;
  --bg-surface:       #0D0D1F;
  --bg-elevated:      #12122A;
  --bg-data:          #111128;
  --bg-overlay:       rgba(255,255,255,0.04);
  --bg-overlay-md:    rgba(255,255,255,0.07);

  /* Accents */
  --saffron:          #FF9933;
  --saffron-dim:      rgba(255,153,51,0.15);
  --saffron-border:   rgba(255,153,51,0.25);
  --saffron-glow:     rgba(255,153,51,0.12);
  --teal:             #00D4AA;
  --teal-dim:         rgba(0,212,170,0.12);
  --purple:           #7C6FFF;
  --purple-dim:       rgba(124,111,255,0.12);
  --red-alert:        #FF4757;
  --red-dim:          rgba(255,71,87,0.12);

  /* Data signals */
  --data-excellent:   #FF9933;
  --data-good:        #00D4AA;
  --data-warning:     #EF9F27;
  --data-poor:        #FF4757;
  --data-critical:    rgba(255,71,87,0.60);

  /* Text */
  --text-primary:     #FFFFFF;
  --text-secondary:   rgba(255,255,255,0.70);
  --text-tertiary:    rgba(255,255,255,0.40);
  --text-muted:       rgba(255,255,255,0.20);
  --text-saffron:     #FF9933;
  --text-teal:        #00D4AA;
  --text-red:         #FF6B7A;

  /* Borders */
  --border-subtle:    rgba(255,255,255,0.06);
  --border-default:   rgba(255,255,255,0.10);
  --border-strong:    rgba(255,255,255,0.18);
  --border-saffron:   rgba(255,153,51,0.30);

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;
  --space-16: 64px; --space-20: 80px;

  /* Radius */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-full: 9999px;

  /* Duration */
  --dur-fast:    150ms;
  --dur-default: 250ms;
  --dur-slow:    400ms;
  --dur-sheet:   320ms;

  /* Easing */
  --ease-default: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-sheet:   cubic-bezier(0.32, 0.72, 0, 1);
}
```
