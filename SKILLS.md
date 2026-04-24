# BimaDarpan — Build Guide for Claude Code
**Technical Skills Document**
Version 1.0 | Written for Claude Code with no-code/low-code context

---

## How to use this document

This file is your complete technical briefing for building BimaDarpan with Claude Code. Read it fully before starting. When working with Claude Code, paste relevant sections as context. Everything here is explained in plain English alongside the technical instruction — you do not need to be a developer to follow this.

---

## Tech Stack — Final Decisions

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Best for SEO (server-side rendering), Claude Code handles it well, free on Vercel |
| Styling | Tailwind CSS + CSS custom properties | Fast to build, consistent, pairs well with Next.js |
| Map | D3.js + India TopoJSON | Free, powerful, gives full control over map appearance |
| Database | Supabase (Postgres) | Free tier sufficient for V1, real-time built-in, easy REST API, migrate to self-hosted later |
| Data pipeline | Python scripts on Railway | Free tier, cron scheduling, handles IRDAI scraping |
| AI — Intelligence | Claude API (claude-sonnet-4-6) | Health check analysis, map insights only (not quiz) |
| Quiz — Phase 1 | Static Supabase question bank | 300 pre-written questions, zero API cost, served randomly |
| Quiz — Phase 2 | DeepSeek V3.2 API | Personalised quiz generation after traction proven, ~₹0.025 per session |
| AI — Language | Sarvam AI (V2 only) | Indian language voice, added post-launch |
| OG Images | Vercel OG (@vercel/og) | Server-generated shareable cards, free |
| Icons | Lucide React | Free, MIT, consistent design |
| Fonts | Google Fonts (DM Sans) + Fontshare (Clash Display) | Free, no API key |
| Hosting | Vercel (frontend) + Railway (Python pipeline) | Both have generous free tiers |

---

## Project Structure

When Claude Code scaffolds the project, this is the folder structure to use:

```
bimadarpan/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, metadata, aurora bg
│   ├── page.tsx                  # Homepage — map + sidebar
│   ├── globals.css               # CSS tokens from DESIGN.md
│   ├── quiz/
│   │   └── page.tsx              # Quiz flow
│   ├── health-check/
│   │   └── page.tsx              # Coverage assessment
│   ├── leaderboard/
│   │   └── page.tsx              # State rankings table
│   ├── news/
│   │   └── page.tsx              # Insurance news feed
│   ├── state/
│   │   └── [slug]/
│   │       └── page.tsx          # Dynamic state pages (SEO)
│   └── api/
│       ├── states/route.ts       # GET all states data
│       ├── state/[slug]/route.ts # GET single state data
│       ├── news/route.ts         # GET news feed
│       ├── leaderboard/route.ts  # GET ranked states
│       ├── quiz/generate/route.ts      # POST — Claude generates quiz questions
│       ├── health-check/analyse/route.ts  # POST — Claude analyses coverage
│       └── og/route.tsx          # GET — Vercel OG image generation
│
├── components/
│   ├── layout/
│   │   ├── Topnav.tsx
│   │   ├── Ticker.tsx
│   │   └── Footer.tsx
│   ├── map/
│   │   ├── IndiaMap.tsx          # D3 map component
│   │   ├── MapControls.tsx       # Layer toggle + type filter
│   │   └── StateTooltip.tsx      # Hover tooltip
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── NationalStats.tsx
│   │   ├── StatePanel.tsx        # Updates on state click
│   │   ├── LeaderboardPreview.tsx
│   │   ├── AIQueryBar.tsx
│   │   └── HealthCheckCTA.tsx
│   ├── quiz/
│   │   ├── QuizCard.tsx
│   │   ├── OptionButton.tsx
│   │   └── ResultCard.tsx
│   ├── health-check/
│   │   ├── QuestionStep.tsx
│   │   └── CoverageReport.tsx
│   ├── leaderboard/
│   │   └── LeaderboardTable.tsx
│   ├── news/
│   │   └── NewsCard.tsx
│   └── ui/                       # Reusable primitives
│       ├── Badge.tsx
│       ├── GlassCard.tsx
│       ├── Button.tsx
│       ├── LiveIndicator.tsx
│       └── Chip.tsx
│
├── lib/
│   ├── supabase.ts               # Supabase client setup
│   ├── claude.ts                 # Anthropic SDK setup
│   ├── constants.ts              # State slugs, category labels
│   └── utils.ts                  # Formatting helpers
│
├── types/
│   └── index.ts                  # TypeScript types for all data shapes
│
├── data-pipeline/                # Python scraper (separate from Next.js)
│   ├── scrapers/
│   │   ├── irdai_scraper.py
│   │   ├── pmjay_scraper.py
│   │   └── news_scraper.py
│   ├── parsers/
│   │   └── pdf_parser.py
│   ├── pipeline.py               # Main orchestrator
│   └── requirements.txt
│
├── public/
│   ├── india-states.json         # TopoJSON for D3 map
│   └── og-bg.png                 # Static aurora bg for OG cards
│
├── .env.local                    # Environment variables (never commit)
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Environment Variables

Create `.env.local` in the project root. Never commit this file.

```bash
# Anthropic (Claude API)
ANTHROPIC_API_KEY=your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Only used server-side

# App
NEXT_PUBLIC_APP_URL=https://bimadarpan.in         # Change to localhost:3000 for dev
```

**Where to get these:**
- Anthropic key: console.anthropic.com → API Keys
- Supabase: supabase.com → new project → Settings → API

---

## Database Schema (Supabase / Postgres)

Run these SQL statements in your Supabase SQL editor to create the tables.

```sql
-- States master table
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- e.g., 'maharashtra'
  name TEXT NOT NULL,                  -- e.g., 'Maharashtra'
  region TEXT,                         -- 'North', 'South', 'East', 'West', 'Northeast', 'Central'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance metrics per state per year
CREATE TABLE state_metrics (
  id SERIAL PRIMARY KEY,
  state_slug TEXT REFERENCES states(slug),
  fiscal_year TEXT NOT NULL,           -- e.g., 'FY25'
  penetration_pct DECIMAL(5,2),        -- e.g., 31.20 (means 31.20%)
  premium_cr DECIMAL(12,2),            -- Total premium in crore INR
  total_policies INTEGER,              -- Number of active policies
  life_premium_cr DECIMAL(12,2),
  health_premium_cr DECIMAL(12,2),
  motor_premium_cr DECIMAL(12,2),
  claim_ratio_pct DECIMAL(5,2),        -- Claims paid / premiums collected
  settlement_ratio_pct DECIMAL(5,2),   -- % of claims settled
  top_insurer TEXT,                    -- Name of leading insurer in this state
  leading_type TEXT,                   -- 'life' | 'health' | 'motor' | 'general'
  majority_category TEXT,              -- 'poor' | 'middle' | 'rich'
  data_source TEXT,                    -- e.g., 'IRDAI Annual Report FY25'
  data_type TEXT DEFAULT 'official',   -- 'official' | 'estimated' | 'proxy'
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_slug, fiscal_year)
);

-- News feed
CREATE TABLE news_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  category TEXT,         -- 'regulatory' | 'claims' | 'market' | 'scandal' | 'government'
  summary TEXT,          -- AI-generated plain-language summary
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions bank
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  scenario_context TEXT,  -- Short italicised setup paragraph shown above question e.g. "Your father just got hospitalised..."
  option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
  correct_option TEXT,    -- 'a' | 'b' | 'c' | 'd' — never sent to client until answer submitted
  explanation TEXT,       -- Honest 2-3 sentence explanation shown after answering
  shock_stat TEXT,        -- Optional single data point shown in explanation card e.g. "23% of Indian health claims have co-pay surprises"
  difficulty TEXT,        -- 'easy' | 'medium' | 'hard'
  category TEXT,          -- 'jargon' | 'mis-selling' | 'products' | 'claims' | 'regulations' | 'reality-check'
  archetype TEXT,         -- 'trap' | 'real-number' | 'agent-script' | 'fine-print' | 'govt-scheme' | 'calculation'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast exclusion filtering (seen IDs query)
CREATE INDEX idx_quiz_questions_id ON quiz_questions(id);
CREATE INDEX idx_quiz_questions_archetype ON quiz_questions(archetype);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);

-- Seed initial state slugs
INSERT INTO states (slug, name, region) VALUES
  ('andhra-pradesh', 'Andhra Pradesh', 'South'),
  ('arunachal-pradesh', 'Arunachal Pradesh', 'Northeast'),
  ('assam', 'Assam', 'Northeast'),
  ('bihar', 'Bihar', 'East'),
  ('chhattisgarh', 'Chhattisgarh', 'Central'),
  ('goa', 'Goa', 'West'),
  ('gujarat', 'Gujarat', 'West'),
  ('haryana', 'Haryana', 'North'),
  ('himachal-pradesh', 'Himachal Pradesh', 'North'),
  ('jharkhand', 'Jharkhand', 'East'),
  ('karnataka', 'Karnataka', 'South'),
  ('kerala', 'Kerala', 'South'),
  ('madhya-pradesh', 'Madhya Pradesh', 'Central'),
  ('maharashtra', 'Maharashtra', 'West'),
  ('manipur', 'Manipur', 'Northeast'),
  ('meghalaya', 'Meghalaya', 'Northeast'),
  ('mizoram', 'Mizoram', 'Northeast'),
  ('nagaland', 'Nagaland', 'Northeast'),
  ('odisha', 'Odisha', 'East'),
  ('punjab', 'Punjab', 'North'),
  ('rajasthan', 'Rajasthan', 'North'),
  ('sikkim', 'Sikkim', 'Northeast'),
  ('tamil-nadu', 'Tamil Nadu', 'South'),
  ('telangana', 'Telangana', 'South'),
  ('tripura', 'Tripura', 'Northeast'),
  ('uttar-pradesh', 'Uttar Pradesh', 'North'),
  ('uttarakhand', 'Uttarakhand', 'North'),
  ('west-bengal', 'West Bengal', 'East'),
  ('delhi', 'Delhi', 'North'),
  ('jammu-kashmir', 'Jammu & Kashmir', 'North'),
  ('ladakh', 'Ladakh', 'North');
```

---

## TypeScript Types

```typescript
// types/index.ts

export interface State {
  id: number;
  slug: string;
  name: string;
  region: string;
}

export interface StateMetrics {
  id: number;
  state_slug: string;
  fiscal_year: string;
  penetration_pct: number;
  premium_cr: number;
  total_policies: number;
  life_premium_cr: number;
  health_premium_cr: number;
  motor_premium_cr: number;
  claim_ratio_pct: number;
  settlement_ratio_pct: number;
  top_insurer: string;
  leading_type: 'life' | 'health' | 'motor' | 'general';
  majority_category: 'poor' | 'middle' | 'rich';
  data_source: string;
  data_type: 'official' | 'estimated' | 'proxy';
  last_updated: string;
}

export interface StateWithMetrics extends State {
  metrics: StateMetrics | null;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  source_url: string;
  category: 'regulatory' | 'claims' | 'market' | 'scandal' | 'government';
  summary: string;
  published_at: string;
  ingested_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  scenario_context: string | null;  // Short setup paragraph displayed above the question in italics
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';  // Never sent to client in session fetch
  explanation: string;
  shock_stat: string | null;  // One-line stat shown in explanation card after answering
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'jargon' | 'mis-selling' | 'products' | 'claims' | 'regulations' | 'reality-check';
  archetype: 'trap' | 'real-number' | 'agent-script' | 'fine-print' | 'govt-scheme' | 'calculation';
}

// Client-safe version — correct_option stripped out before sending to browser
export type QuizQuestionClient = Omit<QuizQuestion, 'correct_option'>;

export interface HealthCheckAnswers {
  age: number;
  dependents: number;         // Number of people depending on user's income
  monthly_income: number;     // In thousands INR
  has_term_insurance: boolean;
  has_health_insurance: boolean;
  health_sum_insured: number; // In lakhs INR, 0 if none
  has_home_loan: boolean;
  has_critical_illness_cover: boolean;
  employer_provides_health: boolean;
}

export interface CoverageReport {
  score: number;              // 0–100
  grade: 'poor' | 'fair' | 'good' | 'excellent';
  has: string[];              // What the user has covered
  missing: string[];          // What they're missing
  recommended_health_cover: number;     // In lakhs INR
  recommended_term_cover: number;       // In lakhs INR
  estimated_annual_premium_min: number; // In INR
  estimated_annual_premium_max: number;
  warning: string;            // Mis-selling risk relevant to their profile
  summary: string;            // 2-sentence plain-language overview
}
```

---

## Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (for API routes only — has higher privileges)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## Claude API Setup & Prompts

```typescript
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

### Quiz — Two-Phase Strategy (Zero Cost Launch)

**Philosophy:** No AI spend until traction is proven. A well-crafted static bank of 300 questions with smart randomisation, no-repeat memory, and archetype balancing is indistinguishable from AI generation for the user — and costs nothing forever.

---

### Question Design Principles (read before generating)

Every question must do three things:

**1. Put the user inside a real scenario.** Not "what is X" — but "this happened to someone, what's actually going on here?" Use `scenario_context` to set the scene: a hospitalisation, an agent visit, a policy renewal, a claim rejection. Your audience has experienced insurance pressure. Meet them there.

**2. Make the wrong answers feel right.** The most powerful learning moment is picking what sounds correct and getting it wrong. "Of course the insurer covers everything — I have full coverage" is exactly what millions of Indians believe. That wrong answer is the point.

**3. The explanation and shock_stat are the shareable product.** After answering, the explanation doesn't just confirm correctness — it exposes an industry reality in 2-3 blunt sentences. The `shock_stat` is one data point that makes them screenshot and forward on WhatsApp.

---

### Six Question Archetypes (50 questions each = 300 total)

| Archetype | What it does | Example setup |
|---|---|---|
| `trap` | Something that sounds like protection but isn't | "Your employer gives you health insurance. You're fully covered, right?" |
| `real-number` | A data point that shocks | "LIC's claim settlement ratio is 98.6%. What does the remaining 1.4% mean in real numbers?" |
| `agent-script` | Expose what agents say vs what's true | "An agent promises 12% guaranteed returns on a ULIP. What's he not saying?" |
| `fine-print` | A clause that kills a claim | "You were hospitalised for a condition you had 3 years ago but never disclosed. The insurer rejects the claim. Can they do this?" |
| `govt-scheme` | What people are already entitled to but don't know | "Your family income is ₹2.5L/year. Which scheme gives you ₹5L health cover completely free?" |
| `calculation` | Show the math they've never done | "₹10,000/year for 20 years into an endowment plan. You get ₹2.5L back. What's your actual annual return?" |

---

### Generation Prompt (paste into Claude.ai — run 6 times, one per archetype)

```
Generate 50 insurance quiz questions for Indian users. Archetype: [ARCHETYPE_NAME]

Archetype definitions:
- trap: sounds like protection but isn't — reveal the gap
- real-number: shocking data point — reveal the scale of the problem
- agent-script: what agents say vs industry reality — expose the gap
- fine-print: a policy clause that kills a claim — reveal what's buried
- govt-scheme: entitlements most Indians don't know they have — reveal the benefit
- calculation: do the math nobody does — reveal the real return or real cost

Rules for every question:
- scenario_context is mandatory — 1-2 sentences setting a real scene (hospitalisation, agent visit, claim, renewal). Written in second person ("Your father...", "You're renewing..."). Never abstract.
- question must flow naturally from the scenario — never repeat context in the question
- wrong options must be plausible — at least 2 options should feel like the right answer
- explanation is 2-3 sentences, blunt, honest — expose industry reality, never soften
- shock_stat is one real data point that contextualises the answer (can be approximate, always India-specific)
- all rupee amounts, percentages, insurer names, scheme names must be India-specific
- difficulty mix: 30% easy, 50% medium, 20% hard

Return ONLY a valid JSON array, no other text, no markdown fences:
[
  {
    "question": "string",
    "scenario_context": "string — 1-2 sentence real scene setup in second person",
    "option_a": "string",
    "option_b": "string",
    "option_c": "string",
    "option_d": "string",
    "correct_option": "a",
    "explanation": "string — 2-3 blunt sentences exposing industry reality",
    "shock_stat": "string — one real India-specific data point, or null",
    "difficulty": "easy|medium|hard",
    "category": "jargon|mis-selling|products|claims|regulations|reality-check",
    "archetype": "trap|real-number|agent-script|fine-print|govt-scheme|calculation"
  }
]
```

Run once per archetype. Combine all 6 arrays (300 questions total) into one JSON file. Seed into Supabase via SQL editor.

**Verify after seeding:**
```sql
SELECT archetype, difficulty, COUNT(*)
FROM quiz_questions
GROUP BY archetype, difficulty
ORDER BY archetype, difficulty;
-- Target: ~50 per archetype, ~90 easy / ~150 medium / ~60 hard total
```

---

### No-Repeat System — How It Works

The browser remembers every question ID the user has seen using `localStorage`. Each new session sends those IDs as an exclusion list. The API filters them out before selecting. The bank resets automatically when fewer than 10 unseen questions remain — by that point the user has seen all 300 and won't remember the first ones.

```
Session 1:  Seen = []          → Pool = 300 questions
Session 2:  Seen = [1-10]      → Pool = 290 questions
Session 3:  Seen = [1-20]      → Pool = 280 questions
...
Session 30: Seen = [1-290]     → Pool = 10 left → serve + auto-reset
Session 31: Seen = []          → Pool = 300 again (fresh start)
```

No login required. Works completely anonymously. No cookies beyond localStorage.

---

### Phase 1 API Routes — Pure Database, Zero AI Cost

```typescript
// app/api/quiz/session/route.ts
// Serves 10 questions per session — exclusion-aware, archetype-balanced, no AI
import { supabase } from '@/lib/supabase';
import { QuizQuestionClient } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seen = searchParams.get('seen');
  const seenIds: number[] = seen
    ? seen.split(',').map(Number).filter(n => !isNaN(n))
    : [];

  // Fetch all columns except correct_option — never expose to client
  const selectFields = 'id, question, scenario_context, option_a, option_b, option_c, option_d, explanation, shock_stat, difficulty, category, archetype';

  let query = supabase.from('quiz_questions').select(selectFields);

  // Exclude already-seen questions
  if (seenIds.length > 0) {
    query = query.not('id', 'in', `(${seenIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Auto-reset: fewer than 10 unseen means bank is nearly exhausted
  if (!data || data.length < 10) {
    const { data: fresh, error: freshError } = await supabase
      .from('quiz_questions')
      .select(selectFields);

    if (freshError || !fresh) {
      return Response.json({ error: 'Failed to load questions' }, { status: 500 });
    }

    const selected = pickBalanced(fresh);
    return Response.json({ questions: selected, reset: true, session_id: crypto.randomUUID() });
  }

  const selected = pickBalanced(data);
  return Response.json({ questions: selected, reset: false, session_id: crypto.randomUUID() });
}

// Pick 10 questions: 1 from each of 6 archetypes, then 4 more randomly
// Falls back gracefully if any archetype has fewer questions than expected
function pickBalanced(pool: any[]): QuizQuestionClient[] {
  const archetypes = ['trap', 'real-number', 'agent-script', 'fine-print', 'govt-scheme', 'calculation'];
  const byArchetype: Record<string, any[]> = {};

  for (const q of pool) {
    const arch = q.archetype || 'trap';
    if (!byArchetype[arch]) byArchetype[arch] = [];
    byArchetype[arch].push(q);
  }

  const selected: any[] = [];
  const usedIds = new Set<number>();

  // One from each archetype first (6 questions)
  for (const arch of archetypes) {
    const available = (byArchetype[arch] || []).filter(q => !usedIds.has(q.id));
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      selected.push(pick);
      usedIds.add(pick.id);
    }
  }

  // Fill remaining slots (up to 10) from the full pool
  const remaining = pool
    .filter(q => !usedIds.has(q.id))
    .sort(() => Math.random() - 0.5);

  selected.push(...remaining.slice(0, 10 - selected.length));

  // Final shuffle so archetype order isn't predictable
  return selected.sort(() => Math.random() - 0.5);
}
```

```typescript
// app/api/quiz/answer/route.ts
// Validates a single answer server-side — correct_option never leaves the server
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { question_id, selected_option } = await request.json();

  if (!question_id || !selected_option) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Only fetch the two fields needed — nothing extra
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('correct_option, explanation, shock_stat')
    .eq('id', question_id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Question not found' }, { status: 404 });
  }

  const is_correct = data.correct_option === selected_option;

  return Response.json({
    is_correct,
    correct_option: data.correct_option,
    explanation: data.explanation,
    shock_stat: data.shock_stat,
  });
}
```

**Security note:** `correct_option` is fetched only in `/api/quiz/answer` — after the user submits. It is never present in the session payload. A user inspecting browser network traffic sees only question text and options — no answers.

---

### Client-Side localStorage — No-Repeat Memory

```typescript
// lib/quiz-memory.ts
// Tracks seen question IDs in browser localStorage — no login, no cookies

const STORAGE_KEY = 'bimadarpan_seen_q';

export function getSeenIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markSeen(ids: number[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSeenIds();
    // Deduplicate using Set, cap at 500 to prevent localStorage bloat
    const updated = [...new Set([...current, ...ids])].slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full or blocked — fail silently
  }
}

export function resetMemory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Build the seen query param for the session API call
export function buildSeenParam(): string {
  return getSeenIds().join(',');
}
```

```typescript
// Usage in your quiz page component (app/quiz/page.tsx)
import { getSeenIds, markSeen, resetMemory, buildSeenParam } from '@/lib/quiz-memory';

async function startNewSession() {
  const seenParam = buildSeenParam();
  const url = `/api/quiz/session${seenParam ? `?seen=${seenParam}` : ''}`;

  const res = await fetch(url);
  const { questions, reset, session_id } = await res.json();

  // If bank was reset server-side, clear local memory too
  if (reset) resetMemory();

  // Mark these questions as seen immediately
  // (before user completes — so even abandoned sessions don't repeat)
  markSeen(questions.map((q: any) => q.id));

  return { questions, session_id };
}
```

**Why mark as seen immediately (before completion):** If a user abandons mid-quiz, you still don't want those same questions on their next attempt. It keeps every session fresh.

---

### Quiz UI Flow — Component Behaviour

The quiz page has three states. Build each as a separate section within `app/quiz/page.tsx`:

**State 1 — Intro screen:**
- Heading: "Do you really know insurance?"
- Sub: "10 questions. Real scenarios. Uncomfortable truths."
- Shows estimated time: ~4 minutes
- Single CTA button: "Start the quiz"
- On click: calls `startNewSession()`, transitions to State 2

**State 2 — Question screen (10 steps):**
- Progress bar at top: saffron fill, animated per question
- Question number: `02 / 10` in mono font, muted
- `scenario_context` displayed above question in italic muted text — sets the scene
- Question text: bold, prominent
- 4 option cards: full width glass cards
  - Default: neutral border
  - Hover: saffron border
  - Selected (before submit): saffron border + faint saffron background
  - After submit — correct: teal border + teal left accent bar
  - After submit — wrong: red border, correct option reveals in teal
- Explanation appears below options with `fade-up` animation after submission
- `shock_stat` appears as a highlighted callout inside the explanation card
- "Next" button appears after submission — saffron, disabled until answered
- No skipping allowed

**State 3 — Result screen:**
- Score: large saffron number e.g. `7 / 10`
- Grade label based on score: 0-3 = Novice, 4-6 = Aware, 7-8 = Smart, 9-10 = Expert
- One personalised line based on lowest-scoring archetype: e.g. "You struggled most with fine-print clauses — the ones that kill claims."
- Shareable card CTA (primary button)
- "Quiz again" secondary button — immediately calls `startNewSession()` with updated seen list

**Score → Grade mapping:**
```typescript
function getGrade(score: number): { label: string; message: string } {
  if (score <= 3) return { label: 'Novice',  message: 'Most Indians score here. The industry counts on this.' };
  if (score <= 6) return { label: 'Aware',   message: 'You know more than most. The fine print still has traps.' };
  if (score <= 8) return { label: 'Smart',   message: 'You\'re harder to fool than most. Share this — your family needs it.' };
  return           { label: 'Expert',  message: 'You understand insurance better than most agents selling it.' };
}
```

---

### Cost of Phase 1

₹0 per month, indefinitely. No API calls during quiz sessions. The only costs are Supabase reads — well within free tier for any realistic v1 traffic.

---

### Phase 2 — DeepSeek Personalised Quiz (Activate after traction)

**Gate conditions — all three must be true before activating:**
- [ ] 500+ quiz completions in one calendar month
- [ ] Shareable cards being generated and shared (check OG image API logs)
- [ ] Users requesting state-specific or topic-specific quizzes (check feedback)

**What Phase 2 adds:** Questions generated fresh based on which state the user just explored on the map, their declared income group from the health check, or topics they searched in the AI query bar. E.g., "You just explored Bihar's map data — here are questions about why Bihar has India's lowest claim settlement ratio at 71%."

**One-time setup:**
1. Register at platform.deepseek.com — no credit card required
2. Receive 5M free tokens on signup (~14,000 personalised sessions for free)
3. Add `DEEPSEEK_API_KEY=your_key_here` to `.env.local`
4. Add `NEXT_PUBLIC_PHASE=2` to `.env.local`

**DeepSeek client (OpenAI-compatible, minimal setup):**

```typescript
// lib/deepseek.ts
import OpenAI from 'openai';

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com',
});
```

**Personalised quiz route:**

```typescript
// app/api/quiz/personalised/route.ts
// Phase 2 only. Generates state/context-specific questions via DeepSeek.
// System prompt is identical every call — auto-cached at $0.028/M tokens (90% saving)
import { deepseek } from '@/lib/deepseek';

export async function POST(request: Request) {
  const { state_name, context_hint, count = 5 } = await request.json();

  // Identical system prompt every call = DeepSeek caches it automatically
  const systemPrompt = `You generate insurance quiz questions for Indian users.
Every question must have: scenario_context (1-2 sentence real scene setup), a blunt honest explanation, and a shock_stat (one India-specific data point).
Wrong options must be plausible. Correct option must not be obvious.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"question":"","scenario_context":"","option_a":"","option_b":"","option_c":"","option_d":"","correct_option":"a","explanation":"","shock_stat":"","difficulty":"easy|medium|hard","category":"","archetype":""}]`;

  const userPrompt = `Generate ${count} insurance quiz questions personalised for a user who just explored ${state_name} on an insurance data map.
Context: ${context_hint || `Focus on insurance realities specific to ${state_name} — local penetration data, claim patterns, common insurers in this state.`}
Make the scenario_context reference this state naturally. Keep questions feeling personal and urgent.`;

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);
    return Response.json({ questions, source: 'ai' });
  } catch {
    // Any failure: silently fall back to static bank
    return Response.json({ error: 'fallback' }, { status: 422 });
  }
}
```

**Fallback logic — Phase 2 degrades silently to Phase 1:**

```typescript
// lib/quiz-session.ts
// Single function used by quiz page — handles both phases transparently
import { buildSeenParam, markSeen, resetMemory } from './quiz-memory';

export async function fetchQuizSession(stateName?: string, contextHint?: string) {
  const isPhase2 = process.env.NEXT_PUBLIC_PHASE === '2';

  // Phase 2: try personalised first
  if (isPhase2 && stateName) {
    try {
      const res = await fetch('/api/quiz/personalised', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state_name: stateName, context_hint: contextHint, count: 10 }),
      });
      if (res.ok) {
        const data = await res.json();
        markSeen(data.questions.map((q: any) => q.id || 0));
        return data;
      }
    } catch {
      // Fall through to static bank silently
    }
  }

  // Phase 1 (default): static bank, always works, always free
  const seenParam = buildSeenParam();
  const url = `/api/quiz/session${seenParam ? `?seen=${seenParam}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.reset) resetMemory();
  markSeen(data.questions.map((q: any) => q.id));
  return data;
}
```

**Phase switch — one env variable:**
```bash
NEXT_PUBLIC_PHASE=1   # Launch: static bank, ₹0
NEXT_PUBLIC_PHASE=2   # After traction: DeepSeek personalisation
```

**Phase 2 cost at scale (after 5M free tokens exhausted):**

| Monthly personalised sessions | Cost |
|---|---|
| 1,000 | ~$0.30 (~₹25) |
| 10,000 | ~$3.00 (~₹250) |
| 100,000 | ~$30.00 (~₹2,500) |

At 100,000 personalised quizzes a month, BimaDarpan has serious traction. ₹2,500/month at that point is immaterial.

### Health Check Analysis Prompt

```typescript
// app/api/health-check/analyse/route.ts
import { anthropic } from '@/lib/claude';
import { HealthCheckAnswers, CoverageReport } from '@/types';

export async function POST(request: Request) {
  const answers: HealthCheckAnswers = await request.json();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Analyse this Indian user's insurance situation and generate a coverage report.
      
      User profile:
      - Age: ${answers.age}
      - Dependents: ${answers.dependents}
      - Monthly income: ₹${answers.monthly_income * 1000}
      - Has term insurance: ${answers.has_term_insurance}
      - Has health insurance: ${answers.has_health_insurance}
      - Health sum insured: ₹${answers.health_sum_insured} lakhs
      - Has home loan: ${answers.has_home_loan}
      - Has critical illness cover: ${answers.has_critical_illness_cover}
      - Employer provides health cover: ${answers.employer_provides_health}
      
      Rules for your analysis:
      1. Be honest and direct, not reassuring
      2. Do NOT recommend specific insurers or products by name
      3. Explain WHY each gap is a real risk in plain language
      4. The warning should mention a specific mis-selling tactic relevant to their profile
      5. Use Indian financial context (rupees, Indian health costs, etc.)
      6. Score 0–100: 0 = completely unprotected, 100 = comprehensively covered
      
      Return ONLY valid JSON. No other text:
      {
        "score": 0-100,
        "grade": "poor|fair|good|excellent",
        "has": ["array of what they have covered"],
        "missing": ["array of what they are missing with brief risk explanation"],
        "recommended_health_cover": number_in_lakhs,
        "recommended_term_cover": number_in_lakhs,
        "estimated_annual_premium_min": number_in_rupees,
        "estimated_annual_premium_max": number_in_rupees,
        "warning": "specific mis-selling warning relevant to their profile",
        "summary": "2-sentence honest overview of their situation"
      }`
    }]
  });

  const content = response.content[0];
  if (content.type !== 'text') return Response.json({ error: 'Unexpected response' }, { status: 500 });

  try {
    const report: CoverageReport = JSON.parse(content.text);
    return Response.json({ report });
  } catch {
    return Response.json({ error: 'Failed to parse report' }, { status: 500 });
  }
}
```

### AI Map Query Prompt

```typescript
// Inside your AIQueryBar component — call this API route
// app/api/map-query/route.ts

export async function POST(request: Request) {
  const { question, stateData } = await request.json();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are BimaDarpan's insurance intelligence assistant. Answer this question about India's insurance landscape concisely and honestly.
      
      Available data context: ${JSON.stringify(stateData)}
      
      User question: ${question}
      
      Rules:
      - Answer in 2–4 sentences maximum
      - Be specific — cite actual state names and numbers from the data
      - Be honest, including about problems in the industry
      - Never recommend specific products or insurers
      - End with one actionable insight if relevant`
    }]
  });

  const content = response.content[0];
  return Response.json({ answer: content.type === 'text' ? content.text : '' });
}
```

---

## Data Pipeline (Python)

### Setup

```bash
cd data-pipeline
pip install -r requirements.txt
```

```
# requirements.txt
requests==2.31.0
pdfplumber==0.10.3
feedparser==6.0.11
supabase==2.3.4
python-dotenv==1.0.0
schedule==1.2.0
beautifulsoup4==4.12.3
```

### News Scraper

```python
# data-pipeline/scrapers/news_scraper.py
import feedparser
import anthropic
from supabase import create_client
from datetime import datetime
import os

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_KEY'])
claude = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

RSS_FEEDS = [
    'https://news.google.com/rss/search?q=insurance+India+IRDAI&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=LIC+insurance+India&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=health+insurance+India&hl=en-IN&gl=IN&ceid=IN:en',
]

def categorise_and_summarise(title: str) -> dict:
    response = claude.messages.create(
        model='claude-haiku-4-5-20251001',  # Use Haiku for cost efficiency on high-volume tasks
        max_tokens=200,
        messages=[{
            'role': 'user',
            'content': f'''Categorise this insurance news headline and write a one-sentence plain-English summary.
            
            Headline: {title}
            
            Categories: regulatory, claims, market, scandal, government
            
            Return JSON only: {{"category": "...", "summary": "..."}}'''
        }]
    )
    import json
    return json.loads(response.content[0].text)

def ingest_news():
    for feed_url in RSS_FEEDS:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:10]:
            existing = supabase.table('news_items').select('id').eq('source_url', entry.link).execute()
            if existing.data:
                continue  # Skip duplicates
            
            meta = categorise_and_summarise(entry.title)
            supabase.table('news_items').insert({
                'title': entry.title,
                'source': feed.feed.title,
                'source_url': entry.link,
                'category': meta['category'],
                'summary': meta['summary'],
                'published_at': datetime(*entry.published_parsed[:6]).isoformat(),
            }).execute()
            print(f'Ingested: {entry.title[:60]}')

if __name__ == '__main__':
    ingest_news()
```

### Pipeline Orchestrator (Cron)

```python
# data-pipeline/pipeline.py
import schedule
import time
from scrapers.news_scraper import ingest_news

def run_all():
    print('Running news ingestion...')
    ingest_news()
    print('Pipeline complete.')

# Run every 15 minutes
schedule.every(15).minutes.do(run_all)

run_all()  # Run immediately on start
while True:
    schedule.run_pending()
    time.sleep(60)
```

### Deploying the pipeline on Railway

1. Create account at railway.app (free tier)
2. New project → Deploy from GitHub (push your `data-pipeline/` folder)
3. Add environment variables in Railway dashboard: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`
4. Set start command: `python pipeline.py`
5. Railway keeps it running 24/7 on free tier

---

## Next.js API Routes — State Data

```typescript
// app/api/states/route.ts
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('state_metrics')
    .select(`
      *,
      states (slug, name, region)
    `)
    .eq('fiscal_year', 'FY25')
    .order('penetration_pct', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
```

```typescript
// app/api/state/[slug]/route.ts
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { data, error } = await supabase
    .from('state_metrics')
    .select(`*, states (slug, name, region)`)
    .eq('state_slug', params.slug)
    .order('fiscal_year', { ascending: false })
    .limit(5);  // Last 5 years for trend

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
```

---

## D3 Map Component — Core Structure

```tsx
// components/map/IndiaMap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { StateWithMetrics } from '@/types';

interface Props {
  statesData: StateWithMetrics[];
  onStateSelect: (slug: string) => void;
  selectedState: string | null;
  colorLayer: 'penetration' | 'premium' | 'claim_ratio' | 'settlement';
}

export function IndiaMap({ statesData, onStateSelect, selectedState, colorLayer }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const colorScale = d3.scaleThreshold<number, string>()
    .domain([10, 15, 20, 25, 30, 35])
    .range(['#0D0A2A', '#1E1260', '#2A1A7A', '#3D2090', '#5530B0', '#7040C8', '#FF9933']);

  const getValue = (slug: string): number => {
    const state = statesData.find(s => s.slug === slug);
    if (!state?.metrics) return 0;
    switch (colorLayer) {
      case 'penetration':   return state.metrics.penetration_pct;
      case 'premium':       return state.metrics.premium_cr / 10000; // Normalise
      case 'claim_ratio':   return state.metrics.claim_ratio_pct;
      case 'settlement':    return state.metrics.settlement_ratio_pct;
      default: return 0;
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();

    const projection = d3.geoMercator()
      .center([82.8, 22.5])
      .scale(width * 2.8)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath(projection);

    fetch('/india-states.json')
      .then(r => r.json())
      .then(topology => {
        const states = topojson.feature(topology, topology.objects.states);

        svg.selectAll('path')
          .data(states.features)
          .join('path')
          .attr('d', path)
          .attr('fill', d => colorScale(getValue(d.properties.slug)))
          .attr('stroke', 'rgba(255,153,51,0.20)')
          .attr('stroke-width', 0.5)
          .attr('cursor', 'pointer')
          .attr('aria-label', d => `${d.properties.name} — ${getValue(d.properties.slug).toFixed(1)}%`)
          .on('mouseover', function(event, d) {
            d3.select(this)
              .attr('stroke', 'rgba(255,153,51,0.60)')
              .attr('stroke-width', 1.5)
              .style('filter', 'brightness(1.2)');
          })
          .on('mouseout', function(event, d) {
            const isSelected = d.properties.slug === selectedState;
            d3.select(this)
              .attr('stroke', isSelected ? 'rgba(255,153,51,0.80)' : 'rgba(255,153,51,0.20)')
              .attr('stroke-width', isSelected ? 2 : 0.5)
              .style('filter', 'brightness(1)');
          })
          .on('click', function(event, d) {
            onStateSelect(d.properties.slug);
          });
      });
  }, [statesData, colorLayer, selectedState]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
```

**Install D3 and topojson:**
```bash
npm install d3 topojson-client
npm install --save-dev @types/d3 @types/topojson-client
```

---

## Vercel OG — Shareable Cards

```tsx
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');     // 'quiz' | 'health'
  const score = searchParams.get('score');
  const grade = searchParams.get('grade');
  const fact = searchParams.get('fact');

  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        background: '#080810',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
          BimaDarpan
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, color: '#FF9933' }}>
          {score}
        </div>
        <div style={{ fontSize: 32, color: '#fff', marginTop: 8 }}>
          {grade}
        </div>
        {fact && (
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: 24, maxWidth: 800, textAlign: 'center' }}>
            {fact}
          </div>
        )}
        <div style={{ fontSize: 18, color: '#FF9933', marginTop: 40 }}>
          bimadarpan.in
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## SEO — Dynamic State Pages

```tsx
// app/state/[slug]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const { data } = await supabase.from('states').select('slug');
  return (data || []).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from('states').select('name').eq('slug', params.slug).single();
  if (!data) return { title: 'State not found' };
  return {
    title: `Insurance in ${data.name} — Penetration, Claims & Data | BimaDarpan`,
    description: `Insurance penetration rates, claim settlement ratios, top insurers, and coverage data for ${data.name}. Updated from IRDAI FY25 official data.`,
  };
}

export default async function StatePage({ params }: { params: { slug: string } }) {
  const { data: stateData } = await supabase
    .from('state_metrics')
    .select('*, states(name, slug, region)')
    .eq('state_slug', params.slug)
    .eq('fiscal_year', 'FY25')
    .single();

  if (!stateData) notFound();

  return (
    <main>
      {/* Full state profile page — data-rich, SEO-optimised */}
      {/* Build this component with the state's full metrics */}
    </main>
  );
}
```

---

## Build Sequence — Step by Step

Follow this order when building with Claude Code. Complete each step before moving to the next.

### Step 1 — Project scaffold
```
Prompt Claude Code: "Create a new Next.js 14 app with App Router, Tailwind CSS, and TypeScript. 
Project name: bimadarpan. Install: @supabase/supabase-js, @anthropic-ai/sdk, d3, 
topojson-client, lucide-react. Create the folder structure from SKILLS.md."
```

### Step 2 — Design tokens
```
Prompt Claude Code: "Create globals.css with all CSS custom properties from DESIGN.md. 
Set up the aurora background animation. Configure Tailwind to use these CSS variables."
```

### Step 3 — Database
```
Action: Go to supabase.com, create a project, run the SQL schema from SKILLS.md.
Seed the states table. Add your .env.local file.
```

### Step 4 — Layout & navigation
```
Prompt Claude Code: "Build Topnav.tsx, Ticker.tsx, and root layout.tsx using the 
design system from DESIGN.md. Include the live indicator. Make the ticker scroll 
continuously with news from the /api/news endpoint."
```

### Step 5 — State data API
```
Prompt Claude Code: "Build /api/states/route.ts and /api/state/[slug]/route.ts 
using the Supabase queries from SKILLS.md."
```

### Step 6 — India map
```
Prompt Claude Code: "Build IndiaMap.tsx using D3 and the India TopoJSON file. 
Use the color scale from DESIGN.md. Implement hover, click, and selection states. 
Call onStateSelect when a state is clicked."
```

### Step 7 — Sidebar & state panel
```
Prompt Claude Code: "Build Sidebar.tsx with NationalStats, StatePanel, 
LeaderboardPreview, AIQueryBar, and HealthCheckCTA components. 
StatePanel should animate in when a state is selected on the map."
```

### Step 8 — Homepage assembly
```
Prompt Claude Code: "Assemble the homepage (app/page.tsx) with the map panel 
and sidebar in a grid layout. Wire up state selection so clicking the map 
updates the sidebar."
```

### Step 9 — Quiz feature (Phase 1 — static bank, zero cost)
```
Action (before coding): Generate 300 questions by running the generation prompt 
from SKILLS.md 6 times in Claude.ai (once per category). Combine into one JSON 
array. Seed into Supabase quiz_questions table via SQL editor.

Prompt Claude Code: "Build the quiz flow using the static bank approach from 
SKILLS.md. API route /api/quiz/session fetches 10 random questions from Supabase 
with balanced difficulty. /api/quiz/answer validates answers server-side — 
correct_option never sent to client in session fetch. Quiz page shows one question 
at a time, tracks score, shows explanation after each answer. Result screen 
generates shareable OG card. No external AI API calls."
```

### Step 9b — Quiz Phase 2 upgrade (only after traction)
```
Condition: Complete only after 500+ quiz completions in one month.

Action: Register at platform.deepseek.com, get API key (5M free tokens, no card).
Add DEEPSEEK_API_KEY to .env.local. Set NEXT_PUBLIC_PHASE=2.

Prompt Claude Code: "Add the DeepSeek personalised quiz route /api/quiz/personalised 
from SKILLS.md. Wire up the fallback logic in the quiz page component so it tries 
personalised first and falls back to static bank silently on any error."
```

### Step 10 — Health check feature
```
Prompt Claude Code: "Build the health check flow. 8-question assessment collects 
user answers, POST to /api/health-check/analyse which calls Claude API, 
display the Coverage Report with score, gaps, and warning."
```

### Step 11 — Leaderboard & news pages
```
Prompt Claude Code: "Build leaderboard page with sortable table (client-side sorting). 
Build news page with card grid, category filter, and infinite scroll."
```

### Step 12 — Dynamic state SEO pages
```
Prompt Claude Code: "Build app/state/[slug]/page.tsx with generateStaticParams 
and generateMetadata from SKILLS.md. Each state page should be a full data 
profile, server-rendered."
```

### Step 13 — Data pipeline
```
Action: Set up data-pipeline/ folder. Install Python requirements.
Test news_scraper.py locally. Deploy to Railway with env variables.
Seed initial insurance data manually into Supabase for all 36 states.
```

### Step 14 — OG shareable cards
```
Prompt Claude Code: "Build app/api/og/route.tsx for quiz and health check 
shareable cards using Vercel OG. Wire up share buttons on result screens."
```

### Step 15 — Mobile responsiveness
```
Prompt Claude Code: "Make the layout mobile-responsive. On screens < 768px: 
sidebar becomes a bottom sheet that slides up when a state is tapped. 
Quiz and health check go full-screen single column."
```

### Step 16 — Deploy
```
Action: Push to GitHub. Connect repo to Vercel. Add environment variables 
in Vercel dashboard. Deploy. Test all 36 state pages are indexed.
```

---

## Supabase → Self-hosted Postgres Migration (When Ready)

When Supabase starts costing money or you want full control:

```bash
# Export from Supabase
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" > backup.sql

# Import to your own Postgres (e.g., on a Hetzner VPS)
psql "postgresql://postgres:[your-password]@[your-server]:5432/bimadarpan" < backup.sql

# Update .env.local
NEXT_PUBLIC_SUPABASE_URL=your_new_url
```

The application code does not change. Only the environment variable changes. This migration takes under 30 minutes.

---

## Cost Estimate (Monthly, V1)

| Service | Free tier | Paid triggers |
|---|---|---|
| Vercel (Next.js hosting) | 100GB bandwidth / month | > 100GB |
| Supabase (database) | 500MB + 50k API calls | > 500MB or heavy traffic |
| Railway (Python pipeline) | 500 hours/month | Always-on exceeds 500h |
| Claude API | Pay per token | Health check + map query calls only |
| DeepSeek API (Phase 2 quiz) | 5M free tokens on signup (~14,000 sessions) | $0.0003/session after |
| Google Fonts + Fontshare | Free forever | — |

**Claude API cost estimate (quiz removed — now free):**
- Health check analysis: ~1,500 tokens → $0.002 per completion
- Map query: ~400 tokens → $0.0006 per query
- News summarisation (Haiku): ~300 tokens → $0.0001 per article
- At 1,000 users/month with 30% health check conversion: ~$1–3/month total AI cost

**DeepSeek cost estimate (Phase 2, after free credits exhausted):**
- Per personalised quiz session: ~$0.0003 (system prompt cached)
- At 10,000 sessions/month: ~$3/month (~₹250)

Total monthly cost at 10,000 MAU (Phase 1): approximately **$5–15/month**.
Total monthly cost at 10,000 MAU (Phase 2): approximately **$8–18/month**.

---

## Data Seeding — Initial State Data

Before launch, manually populate `state_metrics` with FY25 data from IRDAI Annual Report. 

Source PDF: IRDAI Annual Report 2024-25 → available at irdai.gov.in

Key table to find in the PDF: "State-wise Premium Underwritten" and "State-wise Insurance Density and Penetration"

Enter this data directly in Supabase's table editor (no code needed). Minimum fields to fill for each state: `penetration_pct`, `premium_cr`, `settlement_ratio_pct`, `top_insurer`, `leading_type`, `majority_category`.

---

## Notes for Claude Code Sessions

When starting a new Claude Code session, always paste:
1. The relevant section of this SKILLS.md file
2. The relevant section of DESIGN.md (especially the color tokens)
3. The specific component you're building

Claude Code works best with focused, single-component prompts. Don't ask it to build the entire app in one go. Use the step-by-step sequence above.

If Claude Code produces something that doesn't match the design system, paste the relevant DESIGN.md section and say: "Rebuild this component using these exact design tokens."
