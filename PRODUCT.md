# BimaDarpan — Product Document
**India's Insurance Intelligence Platform**
Version 1.0 | Status: Pre-build

---

## Vision

BimaDarpan is a public intelligence platform that makes India's insurance industry fully transparent — state by state, district by district, insurer by insurer. It is not a broker, not a comparison site, not a lead-generation tool. It is the honest mirror India's insurance sector has never had.

The north star experience: anyone in India — a student in Bhubaneswar, a journalist in Delhi, a farmer in Vidarbha, a policymaker in Hyderabad — can come to BimaDarpan and within 60 seconds understand exactly what insurance looks like in their state, what they're missing, and what the truth is about the industry.

**Positioning:** "The platform that tells you what your insurance agent never will."

**Mental model for the product:** Jarvis. Alive, intelligent, responsive. The platform feels like it is aware of you and aware of India's insurance landscape in real time. It surfaces insights before you ask. It speaks your language. It is confident, not cautious.

---

## Name

**BimaDarpan**
- Bima = Insurance (Hindi/Urdu, understood across India)
- Darpan = Mirror (Sanskrit origin, widely used across all Indian languages)
- Together: "The Mirror of Insurance" — holds up an honest reflection of India's insurance reality
- Domain target: bimadarpan.in

---

## Core Principles

1. **Radical honesty** — expose the ugly truth alongside the good. Never soften data.
2. **No commercial agenda** — no broker license, no commissions, no advertiser influence.
3. **Source transparency** — every data point shows its source and last-updated timestamp.
4. **Public first** — free, open, no login required for core features.
5. **India-first design** — built for mobile, built for slow connections, built for every Indian.

---

## Target Audience

All of the following, served by the same platform with different entry points:

| Audience | What they want | How BimaDarpan serves them |
|---|---|---|
| General public | "Do I need insurance? Am I covered enough?" | Health check + plain-language explainers |
| Students & researchers | Data, trends, historical analysis | Raw data access, charts, downloadable CSVs |
| Journalists & media | State comparisons, scandal history, claim ratios | Leaderboard, mis-selling timeline, sharable charts |
| NGOs & policymakers | Coverage gaps by region and income group | Map drill-down, demographic overlays |
| Insurance professionals | Competitive landscape, market data | Insurer rankings, premium trends |

---

## V1 Feature Specification (Launch)

### 1. Interactive India Map (Hero Feature)

**What it does:**
- Full-screen India map, state-level, colored by insurance penetration percentage
- Color scale: critical (<10%) → low (10–20%) → medium (20–30%) → high (30%+)
- Hover on a state: tooltip shows penetration %, top insurer, leading insurance type
- Click on a state: right panel updates with full state detail card

**State detail card shows:**
- Insurance penetration %
- Total premium collected (₹ Cr)
- Top insurer in that state
- Leading insurance type (life / health / motor)
- Claim settlement ratio %
- Majority policyholder category (poor / middle class / rich)
- Number of active policies
- Source + last updated date

**Map controls:**
- Toggle layer: penetration / premium volume / claim ratio / top insurer
- Filter by insurance type: all / life / health / motor / general

**Technical note:** Built with D3.js + India TopoJSON. Full GeoJSON with all 36 states and UTs. Each state is a clickable SVG path.

---

### 2. Insurance Knowledge Quiz

**What it does:**
- 10-question quiz testing insurance literacy
- Questions generated and varied by Claude API (so no two sessions are identical)
- Difficulty adapts: starts easy, gets harder based on correct answers
- Covers: jargon, mis-selling, claim processes, product types, IRDAI rules

**Flow:**
1. Landing prompt: "Test what you know about insurance in India"
2. 10 questions, one at a time, 4 options each
3. After each answer: brief explanation of why it's correct/wrong (Claude-generated)
4. Final screen: score out of 10, grade (Novice / Aware / Smart / Expert), personalised advice
5. Shareable card generated (see below)

**Shareable card:**
- Auto-generated image via Vercel OG
- Shows: score, grade, one surprising fact they learned, BimaDarpan branding
- One-tap share to WhatsApp, Instagram, Twitter/X
- Card text: "I scored 7/10 on India's toughest insurance quiz. Do you know more than me?"

---

### 3. Personal Insurance Health Check

**What it does:**
- 6–8 question assessment of the user's current insurance situation
- Questions cover: age, dependents, income, existing policies, home loan, health conditions
- Claude API analyses answers and generates a personalised coverage gap report

**Output — the Coverage Report:**
- Overall coverage score (0–100)
- What you have: ✓ items
- What you're missing: ✗ items with plain-language explanation of the risk
- Recommended coverage amounts (with how to calculate, not which product to buy)
- Estimated annual premium range for what they need
- One honest warning: "Watch out for..." (mis-selling risk relevant to their profile)

**Important:** The report never recommends a specific insurer or product. It educates on what to look for. This keeps BimaDarpan neutral.

**Shareable card:** Coverage score + top gap + "Get your free insurance health check at BimaDarpan"

---

### 4. Live News & Intelligence Feed

**What it does:**
- Continuously updated feed of insurance-relevant news from India
- Sources: IRDAI press releases, insurer quarterly filings, Google News RSS (insurance India)
- AI-powered summarisation: each news item gets a one-line plain-English summary
- Categorised: Regulatory / Claims / Market / Scandal / Government Schemes

**Ticker (top of screen):**
- Scrolling horizontal ticker of latest 10 headlines
- Refreshes every 15 minutes

**Full feed page:**
- Cards with headline, source, category badge, timestamp, AI summary
- Filter by category
- Search within feed

---

### 5. State Leaderboard

**What it does:**
- Ranked list of all 36 states + UTs across multiple dimensions
- User selects ranking metric: penetration / premium / claim ratio / settlement speed

**Leaderboard columns:**
- Rank (with change from previous year: ↑↓)
- State name
- Score on selected metric
- Trend sparkline (3-year direction)
- One contextual badge: "Best claim settlement" / "Fastest growing" / "Most underinsured"

**Shame + pride dynamic:**
- Top 3 states highlighted in saffron (pride)
- Bottom 3 states highlighted in muted red (accountability, not shame — with context why)
- Clicking any state jumps to the map with that state selected

---

## V2 Feature Specification (Post-launch, 3–6 months)

### District-level drill-down
- Click a state on the map → state expands into district view
- All metrics available at district level where IRDAI/PM-JAY data permits
- Priority districts: tier-2 cities first (Pune, Nagpur, Coimbatore, Kochi, etc.)

### Multilingual support
- Begin with Hindi + English (auto-detect browser language)
- Add Tamil, Telugu, Kannada, Bengali, Marathi in subsequent releases
- AI responses (health check, quiz explanations) served in user's language
- Sarvam AI / Bhashini for Indian language processing

### Voice interaction (V2.1)
- Voice-first query: user asks a question in their language
- BimaDarpan responds with spoken answer + highlights relevant area on map
- "Which state has the worst claim settlement ratio?" → spoken answer + map highlights Bihar
- Built on Sarvam AI for Indian language STT/TTS + Claude for intelligence

### Historical comparison
- Slide a timeline: see how any state's penetration changed from 2005 to today
- Animated map showing the spread of insurance across India over 20 years
- Key events annotated: IRDAI 2000, ULIP reform 2010, COVID peak 2021

### Insurer report cards
- Deep profile for each of the 69 IRDAI-registered insurers
- Claim settlement ratio history, complaint ratio, premium growth, solvency margin
- User reviews / experiences (moderated)
- "Red flag" alerts for insurers with high complaint ratios

---

## Monetisation (Decided later — options kept open)

The product launches with zero monetisation. Revenue is considered only after meaningful traffic. Viable paths, in order of alignment with mission:

1. **Grants / CSR funding** — approach insurance literacy foundations, IRDAI consumer education fund
2. **Freemium data access** — free for individuals, paid API for researchers/journalists/institutions
3. **B2B reports** — state-level insurance gap reports sold to NGOs, state governments, consulting firms
4. **Donations** — Wikipedia model, annual campaign
5. **Sponsored research** — insurers pay for independent research reports (editorial independence maintained)

What will never happen: commissions, affiliate links, paid rankings, advertising that influences content.

---

## Data Strategy

### V1 Data Sources (All free, all public)

| Source | Data provided | Update frequency |
|---|---|---|
| IRDAI Annual Handbook | State-wise premium, penetration, insurer data | Annual (auto-ingested on release) |
| PM-JAY NHA Dashboard | Ayushman Bharat coverage by state + district | Daily (API available) |
| NFHS-5 Survey | Household insurance ownership by state, income group | Published (static, 2021) |
| Listed insurer filings | LIC, HDFC Life, SBI Life, ICICI Pru quarterly data | Quarterly |
| Google News RSS | Insurance news headlines India | Every 15 minutes |
| IRDAI press releases | Regulatory updates, new registrations | As published |

### Data Pipeline Architecture

```
Sources → Python scraper (cron job) → Cleaned JSON → Supabase (Postgres) → Next.js API routes → Frontend
```

- Scraper runs on Railway or Render (free tier sufficient for V1)
- PDF parsing: Python + pdfplumber for IRDAI handbook
- News: feedparser library for RSS ingestion
- All data timestamped at ingestion
- Supabase exposes data via auto-generated REST API

### Honesty layer (non-negotiable)
Every data point displayed shows:
- Source name (e.g., "IRDAI Annual Report FY24")
- Last updated date
- Data type: "Official" / "Estimated" / "Proxy"

No fake precision. If district-level data is unavailable, the UI shows "State-level data only" rather than extrapolating.

---

## SEO Strategy

BimaDarpan's SEO is structural, not a campaign. Every page is indexable by Google.

**URL structure:**
- `/` — homepage with map
- `/state/maharashtra` — Maharashtra state page (full data, text summary)
- `/state/maharashtra/districts` — V2 district page
- `/insurer/lic` — V2 insurer profile
- `/learn/what-is-term-insurance` — educational article
- `/quiz` — insurance quiz
- `/health-check` — coverage assessment
- `/leaderboard` — state rankings
- `/news` — insurance news feed

**Each state page is a real HTML page** with:
- H1: "Insurance in [State]: Penetration, Claims & Top Insurers (FY25)"
- Meta description auto-generated from state data
- Schema markup for data tables
- Internal links to neighbouring states
- Target keywords: "[state] insurance penetration", "best health insurance [state]", "[state] LIC claim settlement"

**Content strategy:** One 800-word educational article per week, targeting high-volume insurance queries in Hindi and English. These articles link to relevant state pages and quiz.

---

## Success Metrics (V1, first 6 months)

| Metric | Target |
|---|---|
| Monthly active users | 10,000 |
| Quiz completions | 5,000 |
| Health check completions | 3,000 |
| Shareable cards generated | 2,000 |
| Average session duration | 4+ minutes |
| Organic search traffic | 40% of total |
| State pages indexed by Google | 36/36 |
| News feed update frequency | Every 15 minutes |

---

## What BimaDarpan Is Not

- Not an insurance broker or aggregator
- Not a comparison platform (does not link to buy policies)
- Not a government portal
- Not a paid advisory service
- Not a platform that earns commissions of any kind

This is non-negotiable and must be stated clearly on the platform's about page, footer, and in every piece of communications.
