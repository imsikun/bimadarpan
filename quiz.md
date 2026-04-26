# BimaDarpan — Quiz System
**Complete Design & Build Document**
Version 1.0 | Status: Planned — build after map, health check, leaderboard, news

---

## Why This Document Exists

The quiz system is the most complex feature in BimaDarpan. It has three distinct parts that must be built in order:

1. **Admin tool** — generates and quality-scores questions automatically
2. **Question bank** — 300 questions stored in Supabase, lifecycle-managed
3. **Quiz page** — the user-facing experience

This document covers all three completely. When you are ready to build, hand this file to Claude Code as context.

---

## Current Status

- [ ] Database schema updated with new columns
- [ ] Admin tool built
- [ ] First batch of questions generated (target: 300)
- [ ] Quiz page built
- [ ] OG shareable card built
- [ ] Quiz linked from navbar

**Decision: Quiz is paused until map, health check, leaderboard, and news pages are complete.**

---

## Part 1 — Database Schema

### Updates needed to quiz_questions table

Run this in Supabase SQL editor before building anything:

```sql
-- Add lifecycle and quality columns to existing table
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  -- 'published' | 'review' | 'rejected'

  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  -- 0–100 overall weighted score

  ADD COLUMN IF NOT EXISTS quality_breakdown JSONB,
  -- {
  --   scenario_realism: 85,
  --   wrong_answer_plausibility: 70,
  --   language_simplicity: 90,
  --   educational_value: 75,
  --   india_specificity: 80,
  --   uniqueness: 65,
  --   rejection_reason: "Wrong answers too obvious"
  -- }

  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_quiz_status ON quiz_questions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_score  ON quiz_questions(quality_score);

-- CRITICAL: Update the quiz session route to only serve published questions
-- /api/quiz/session must add this filter:
-- .eq('status', 'published')
```

### Verify existing columns are present

The table must already have these from SKILLS.md:
- `id`, `question`, `scenario_context`
- `option_a`, `option_b`, `option_c`, `option_d`
- `correct_option`, `explanation`, `shock_stat`
- `difficulty`, `category`, `archetype`
- `created_at`

---

## Part 2 — Question Design

### Target audience

Indians who are aware of insurance but either:
- Have insurance they don't fully understand
- Know they should buy but haven't yet
- Bought something from an agent without reading the fine print

They know what "premium" means. They've sat through an agent's pitch. They haven't read their policy carefully. They are not insurance-illiterate — they are insurance-distrustful.

### The core principle

**Never ask "what does X mean." Always ask "what happens when X applies to you."**

Every question must make the user think one of two things:
- "Wait — does MY policy have this?" (self-recognition)
- "I had no idea this was happening" (industry exposure)

Both of those are shareable. Both build trust in BimaDarpan.

### Language rules — non-negotiable

- Write like explaining to a friend over chai — not like a policy document
- Maximum 8th grade reading level
- No jargon without immediate plain explanation in the same sentence
  - Good: "co-pay (the amount YOU pay from your own pocket)"
  - Bad: "the co-payment stipulated in the policy schedule"
- scenario_context sounds like something that happened to your neighbour
- Wrong options must sound like things a real person would actually believe
- Use ₹ amounts that feel real to a middle-class Indian family:
  - ₹5,000 / ₹50,000 / ₹2 lakh / ₹10 lakh / ₹1 crore
  - NOT ₹1,000,000 or abstract large numbers
- Avoid: pursuant, aforementioned, indemnify, subrogation, actuary, peril, endorsement
- Use: cover, claim, pay, reject, agent, policy, hospital bill, family

### Example — good vs bad

**Bad (too formal, tests definition not reality):**
> What does "co-pay" mean in a health insurance policy?
> A) The hospital co-operates with the insurer
> B) You pay a fixed % of the claim
> C) Insurer pays alongside another insurer
> D) A pre-hospitalisation payment

**Good (real scenario, tests survival knowledge):**
> *Your mother just came out of hospital. The bill is ₹2 lakh. When you go to claim, the insurance company says you have to pay 20% yourself — something the agent never mentioned when selling the policy.*
>
> How much does your family have to arrange from their own pocket?
> A) Nothing — that is what insurance is for
> B) ₹40,000 — and this clause was on page 8 of the policy
> C) ₹20,000 flat fee
> D) Depends on which doctor treated her

### The six archetypes

Target: 300 questions total, weighted by impact:

| Archetype | Count | What it teaches |
|---|---|---|
| `trap` | 60 | Sounds like protection but isn't |
| `fine-print` | 60 | The clause that kills a claim |
| `govt-scheme` | 50 | Free entitlements most Indians don't know they have |
| `real-number` | 50 | The actual shocking scale of the problem |
| `agent-script` | 50 | What agents say vs what's actually true |
| `calculation` | 30 | The real math nobody does for them |

**Archetype plain-English labels (for result screen):**
- trap → "situations that look safe but aren't"
- real-number → "the real scale of the problem"
- agent-script → "what agents say vs what's true"
- fine-print → "the clauses that kill claims"
- govt-scheme → "free government schemes you're entitled to"
- calculation → "the real math behind insurance products"

---

## Part 3 — Admin Tool

### Overview

A completely separate internal web application. Not part of the public BimaDarpan site.

- **URL:** admin.bimadarpan.in (separate Vercel deployment)
- **Stack:** Next.js, same Supabase database, Claude API
- **Auth:** Simple hardcoded password in environment variable
- **Purpose:** Generate questions, review borderline ones, monitor question bank health

### Authentication

Simple middleware password check — no auth library needed:

```typescript
// middleware.ts in admin tool
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const password = request.cookies.get('admin_auth')?.value;
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}
```

Login page: single password field, stores cookie on success. No username needed.

### Admin tool pages

**Page 1 — Dashboard (home)**

Four stat cards at top:
- Total published questions
- Questions in review queue
- Total rejected (all time)
- Average quality score across published questions

Generation panel below stats:
- Archetype dropdown (all 6 options)
- Count selector (10 / 20 / 50)
- "Generate Questions" button
- Real-time progress bar showing generation as it happens:
  - Questions processed: X / Y
  - Auto-published: N (green)
  - Held for review: N (amber)
  - Auto-rejected: N (red)

**Page 2 — Review Queue**

All questions with `status = 'review'` (score 50-79).
Sorted by quality_score descending (best first).

For each question, show:
- Archetype badge + difficulty badge + score badge
- Quality breakdown: 6 horizontal bars (one per criterion)
  - Bar in red if that criterion scored below 60 (the flag)
- Flag reason from quality_breakdown.rejection_reason
- Full question preview: scenario_context + question + all 4 options
  (correct option highlighted in teal)
- Three action buttons:
  - ✓ Publish — sets status = 'published'
  - ✗ Reject — sets status = 'rejected'
  - ↻ Regenerate — generates a new question with the same archetype,
    discards this one (sets to 'rejected'), adds new one to queue

**Page 3 — Published Questions**

All questions with `status = 'published'`.
Filterable by: archetype, difficulty, quality_score range.
Sortable by: score, generated_at, archetype.

For each row: ID, archetype, difficulty, score, first 60 chars of question, generated_at.
Actions: View full question (expandable), Unpublish (sets back to 'review').

**Page 4 — Stats**

- Questions by archetype (horizontal bar chart)
- Average quality score by archetype (shows which archetype generates best)
- Rejection rate by archetype (shows which archetype is hardest to generate)
- Questions added over time (line chart by week)
- Score distribution histogram (how many questions at each score band)

### Generation API route

```typescript
// app/api/admin/generate/route.ts
// Handles one question at a time, called in a loop from the frontend
// Frontend loops count times, showing real-time progress

import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const { archetype } = await request.json();

  const archetypeDefinitions: Record<string, string> = {
    'trap':         'Something that sounds like protection but isn\'t — reveal the gap between perception and reality',
    'real-number':  'A shocking data point about the scale of India\'s insurance problem — make the abstract concrete',
    'agent-script': 'Expose the gap between what insurance agents say and what is actually true',
    'fine-print':   'A policy clause buried in the document that will kill a claim when it matters most',
    'govt-scheme':  'A government insurance entitlement most Indians don\'t know they already have',
    'calculation':  'The real math behind an insurance product that nobody does — reveal the actual return or cost',
  };

  const prompt = `You are generating and self-evaluating an insurance quiz question for BimaDarpan — India's insurance intelligence platform.

TARGET AUDIENCE: Indians who know what "premium" means, have maybe sat through an agent pitch, but haven't read their policy carefully. They are insurance-distrustful, not insurance-illiterate.

ARCHETYPE: ${archetype}
ARCHETYPE GOAL: ${archetypeDefinitions[archetype]}

LANGUAGE RULES (strict):
- Write like explaining to a friend over chai — not like a policy document
- Maximum 8th grade reading level
- No jargon without immediate plain explanation in the same sentence
- scenario_context must sound like something that happened to your neighbour
- Wrong options must sound like things a real person would genuinely believe
- Use real Indian amounts: ₹50,000 / ₹2 lakh / ₹5 lakh / ₹1 crore
- Use real Indian insurers (LIC, HDFC Life, Star Health, Bajaj Allianz etc.)
- Use real Indian government schemes (PM-JAY, PMSBY, PMJJBY, Ayushman Bharat)
- Forbidden words: pursuant, aforementioned, indemnify, subrogation, actuary, peril, endorsement

STEP 1: Generate the question following all rules above.

STEP 2: Score your own question on each criterion (0–100):

scenario_realism (weight 25%):
- 90–100: Describes a specific, vivid Indian household situation with real stakes
- 70–89: Real situation but slightly generic
- 50–69: Could be anywhere, lacks Indian specificity
- Below 50: Abstract or unrealistic

wrong_answer_plausibility (weight 25%):
- 90–100: All 3 wrong options sound completely believable to a non-expert
- 70–89: 2 wrong options are very plausible
- 50–69: 1 wrong option is obviously wrong to anyone
- Below 50: Multiple obviously wrong options — question is too easy

language_simplicity (weight 20%):
- 90–100: Sounds like a knowledgeable friend explaining over chai
- 70–89: Mostly simple with one or two complex phrases
- 50–69: Some jargon without explanation
- Below 50: Sounds like a policy document

educational_value (weight 15%):
- 90–100: The explanation could save the reader real money or prevent real harm
- 70–89: Useful insight but not immediately actionable
- 50–69: Interesting but low practical value
- Below 50: Trivial or already widely known

india_specificity (weight 10%):
- 90–100: Uses real Indian insurers, real scheme names, real rupee amounts
- 70–89: Indian context but generic amounts or unnamed insurers
- Below 50: Could be from any country

uniqueness (weight 5%):
- 90–100: Fresh angle not seen in standard insurance quizzes
- Below 50: Identical to common insurance trivia questions

STEP 3: Calculate weighted overall score:
overall = (scenario_realism * 0.25) + (wrong_answer_plausibility * 0.25) + 
          (language_simplicity * 0.20) + (educational_value * 0.15) + 
          (india_specificity * 0.10) + (uniqueness * 0.05)

STEP 4: If any single criterion scores below 60, write one sentence explaining the main weakness in rejection_reason. Otherwise set rejection_reason to null.

Return ONLY valid JSON, no markdown, no other text:
{
  "question": "string — the actual question (not repeating scenario)",
  "scenario_context": "string — 1-2 sentence real scene in second person",
  "option_a": "string",
  "option_b": "string",
  "option_c": "string",
  "option_d": "string",
  "correct_option": "a|b|c|d",
  "explanation": "string — 2-3 blunt honest sentences exposing industry reality",
  "shock_stat": "string — one real India-specific data point, or null",
  "difficulty": "easy|medium|hard",
  "category": "jargon|mis-selling|products|claims|regulations|reality-check",
  "archetype": "${archetype}",
  "quality": {
    "scenario_realism": 0-100,
    "wrong_answer_plausibility": 0-100,
    "language_simplicity": 0-100,
    "educational_value": 0-100,
    "india_specificity": 0-100,
    "uniqueness": 0-100,
    "overall_score": 0-100,
    "rejection_reason": "string or null"
  }
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return Response.json({ error: 'Unexpected response' }, { status: 500 });
  }

  try {
    const data = JSON.parse(content.text.replace(/```json|```/g, '').trim());
    const quality = data.quality;

    // Determine status from overall score
    let status: string;
    if (quality.overall_score >= 80)  status = 'published';
    else if (quality.overall_score >= 50) status = 'review';
    else status = 'rejected';

    // Insert into Supabase (even rejected ones — for stats)
    const { data: inserted, error } = await supabaseAdmin
      .from('quiz_questions')
      .insert({
        question:          data.question,
        scenario_context:  data.scenario_context,
        option_a:          data.option_a,
        option_b:          data.option_b,
        option_c:          data.option_c,
        option_d:          data.option_d,
        correct_option:    data.correct_option,
        explanation:       data.explanation,
        shock_stat:        data.shock_stat,
        difficulty:        data.difficulty,
        category:          data.category,
        archetype:         data.archetype,
        status:            status,
        quality_score:     quality.overall_score,
        quality_breakdown: quality,
        generated_at:      new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({
      id:           inserted.id,
      status:       status,
      quality_score: quality.overall_score,
      rejection_reason: quality.rejection_reason,
    });

  } catch {
    return Response.json({ error: 'Failed to parse Claude response' }, { status: 500 });
  }
}
```

### Cost of generation

Each question generation call:
- Input: ~800 tokens
- Output: ~600 tokens
- Total: ~1,400 tokens
- Cost at Claude Sonnet pricing: ~$0.012 per question

Full bank of 300 questions: **~$3.60 one time**
Regenerating 50 borderline ones: **~$0.60**
Total to fill question bank: **under $5**

---

## Part 4 — No-Repeat System

Already built in `lib/quiz-memory.ts`. Do not rebuild.

How it works:

```
Session 1:  Seen = []        → Pool = all published questions
Session 2:  Seen = [1-10]    → Pool = published minus seen
Session 3:  Seen = [1-20]    → Pool = published minus seen
...
Near end:   Seen = [1-290]   → < 10 unseen → auto-reset
Next:       Seen = []        → Full pool again (fresh start)
```

The session route sends seen IDs as a query param:
`GET /api/quiz/session?seen=4,67,23,189,45`

The API filters those out before selecting 10.
Questions are marked as seen immediately on fetch — not on completion.
This means even abandoned sessions don't repeat questions.

### Critical filter to add to session route

```typescript
// app/api/quiz/session/route.ts
// Add this filter — only serve published questions
let query = supabase
  .from('quiz_questions')
  .select(selectFields)
  .eq('status', 'published');  // ← ADD THIS LINE
```

---

## Part 5 — Quiz Page (User-Facing)

### Three screens, one page

```typescript
type QuizState = 'intro' | 'question' | 'result';
```

### Screen 1 — Intro

Centered, max-width 520px, vertically centered in page.
Aurora background from globals.css.

Content:
- Label: "INSURANCE REALITY CHECK" — 10px uppercase muted
- Heading: "Do you really know insurance?" — 32px Clash Display
- Sub: "10 questions. Real situations. Uncomfortable truths." — 15px muted
- Time: "~ 4 minutes" — 13px very muted
- CTA button: "Start the quiz →" — saffron primary, full width

On click: call `startQuiz()`, transition to Screen 2.

### Screen 2 — Question Flow

Centered, max-width 580px.

**Progress bar:** Full width, edge to edge, 4px height.
Saffron fill = `(currentIndex / 10) * 100%`. Transitions smoothly.

**Header:** "Question" label left, "03 / 10" mono right.

**Scenario context** (if exists):
- Italic, 13px, muted
- Left border: 2px solid rgba(255,255,255,0.12)
- Background: rgba(255,255,255,0.03)
- Padding: 10px 14px
- If null: render nothing

**Question text:** 18px DM Sans 600, line-height 1.5.

**Option cards** (4 cards):
- Background: #111128 solid
- Border: 1px solid rgba(255,255,255,0.08)
- Border-radius: 10px
- Padding: 14px 16px
- Letter badge (A/B/C/D): 24×24px circle, muted bg

**Option states after answering:**

| State | Treatment |
|---|---|
| Selected + Correct | Teal border, teal bg tint, CheckCircle icon right |
| Selected + Wrong | Red border, red bg tint, XCircle icon right |
| Unselected = Correct | Teal border, faint teal bg (revealed) |
| Other unselected | opacity 0.45, pointer-events none |

Selecting an option immediately calls `/api/quiz/answer` — no separate submit button.

**Explanation card** (appears immediately after answer, fade-up 250ms):
- Background: #111128
- Result line: "✓ Correct" teal OR "✗ Incorrect" red
- Explanation text: 13px, muted, line-height 1.6

**Shock stat callout** (inside explanation, if exists):
- Background: rgba(255,153,51,0.08)
- Left border: 2px solid #FF9933
- Padding: 8px 12px
- Text: 12px italic, rgba(255,255,255,0.70)
- BarChart2 icon 12px saffron prepended

**Next button:** Appears after explanation. Saffron. "Next question →" or "See my results →" on Q10.

### Screen 3 — Result

Centered, max-width 520px.

**Score:** "7 / 10" — 48px JetBrains Mono 700, saffron.

**Grade + message:**

| Score | Grade | Message |
|---|---|---|
| 0–3 | Novice | "Most Indians score here. The industry counts on this." |
| 4–6 | Aware | "You know more than most. The fine print still has traps." |
| 7–8 | Smart | "You are harder to fool than most. Share this with your family." |
| 9–10 | Expert | "You understand insurance better than most agents selling it." |

**Weakest area:** Find lowest correct% from scores.byArchetype.
Show archetype plain-English label (see Part 2).

**Action buttons:**
- "Share your result" — saffron primary, full width
- "Try again" — ghost button, full width

### State management

```typescript
// State variables needed in quiz page
const [quizState, setQuizState]       = useState<QuizState>('intro');
const [questions, setQuestions]       = useState<QuizQuestionClient[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [selectedOption, setSelected]   = useState<string | null>(null);
const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
const [scores, setScores]             = useState({
  correct: 0,
  byArchetype: {} as Record<string, { correct: number; total: number }>
});
const [sessionId, setSessionId]       = useState<string>('');
```

### startQuiz() function

```typescript
async function startQuiz() {
  const seenParam = buildSeenParam();
  const url = `/api/quiz/session${seenParam ? `?seen=${seenParam}` : ''}`;

  const res = await fetch(url);
  const { questions, reset, session_id } = await res.json();

  if (reset) resetMemory();
  markSeen(questions.map((q: any) => q.id));

  setQuestions(questions);
  setCurrentIndex(0);
  setSelectedOption(null);
  setAnswerResult(null);
  setScores({ correct: 0, byArchetype: {} });
  setSessionId(session_id);
  setQuizState('question');
}
```

### Answer selection flow

```typescript
async function handleOptionSelect(option: string) {
  if (answerResult) return; // Already answered
  setSelected(option);

  const res = await fetch('/api/quiz/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_id: questions[currentIndex].id,
      selected_option: option,
    }),
  });

  const result = await res.json();
  setAnswerResult(result);

  // Update scores
  const archetype = questions[currentIndex].archetype;
  setScores(prev => ({
    correct: prev.correct + (result.is_correct ? 1 : 0),
    byArchetype: {
      ...prev.byArchetype,
      [archetype]: {
        correct: (prev.byArchetype[archetype]?.correct || 0) + (result.is_correct ? 1 : 0),
        total:   (prev.byArchetype[archetype]?.total   || 0) + 1,
      }
    }
  }));
}
```

---

## Part 6 — OG Shareable Card

### Route: app/api/og/route.tsx

```typescript
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const score     = searchParams.get('score') || '7';
  const total     = searchParams.get('total') || '10';
  const grade     = searchParams.get('grade') || 'Smart';
  const shockStat = searchParams.get('stat')  || '';

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      background: '#080810',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', padding: '60px',
    }}>
      <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.40)',
        letterSpacing: '0.1em', marginBottom: 24 }}>
        BIMADARPAN · INSURANCE REALITY CHECK
      </div>
      <div style={{ fontSize: 96, fontWeight: 700, color: '#FF9933',
        lineHeight: 1 }}>
        {score} / {total}
      </div>
      <div style={{ fontSize: 32, color: '#ffffff', marginTop: 16,
        fontWeight: 600 }}>
        {grade}
      </div>
      {shockStat && (
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)',
          marginTop: 32, maxWidth: 700, textAlign: 'center',
          lineHeight: 1.5, fontStyle: 'italic' }}>
          "{shockStat}"
        </div>
      )}
      <div style={{ fontSize: 18, color: '#FF9933', marginTop: 48 }}>
        Can you beat this? → bimadarpan.in/quiz
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
```

### Share button behaviour

On "Share your result" click:

1. Find one shock_stat from a question the user got wrong (more impactful)
2. Build OG URL:
   ```
   /api/og?score=7&total=10&grade=Smart&stat=[encoded shock stat]
   ```
3. Show share modal with two options:
   - **Share on WhatsApp:**
     ```
     https://wa.me/?text=I scored 7/10 on India's toughest 
     insurance quiz. Do you know more than me?
     %0A%0Abimadarpan.in/quiz
     ```
   - **Copy link:** copies `bimadarpan.in/quiz` to clipboard,
     shows "Copied!" for 2 seconds
4. Show OG card as preview image in modal: `<img src={ogUrl} />`

---

## Part 7 — Build Sequence

Follow this exact order. Do not skip steps.

### Step 1 — Update database schema
Run the ALTER TABLE SQL from Part 1 in Supabase SQL editor.
Update `/api/quiz/session` to filter by `status = 'published'`.

### Step 2 — Build admin tool (separate repo)
```
Prompt Claude Code: "Build a separate Next.js admin tool for 
BimaDarpan quiz management. Use quiz.md as the complete spec.
Build in this order: auth middleware → dashboard page → 
generation API route → review queue page → published questions page.
Connect to the same Supabase database as BimaDarpan."
```

### Step 3 — Generate first batch of questions
Open admin tool. Generate 50 questions per archetype (300 total).
Monitor quality scores. Review borderline ones (score 50-79).
Target: at least 200 published questions before launching quiz.

### Step 4 — Build quiz page
```
Prompt Claude Code: "Build the quiz page at app/quiz/page.tsx.
Use quiz.md as the complete spec. The question bank is seeded.
Build all three screens: intro, question flow, result."
```

### Step 5 — Build OG card route
```
Prompt Claude Code: "Build app/api/og/route.tsx from quiz.md.
Wire the share button on the quiz result screen."
```

### Step 6 — Test end to end
- Generate a quiz session
- Answer all 10 questions
- Verify no-repeat system works (check localStorage)
- Verify result screen shows correct grade
- Test share button — WhatsApp URL and copy link both work
- Verify admin tool shows the questions as published

### Step 7 — Launch quiz
Add Quiz link to navbar (already there visually, just needs the page to work).

---

## Part 8 — Open Questions (Decide Before Building)

These are decisions not yet made. Resolve before handing to Claude Code:

**1. Regenerate button in review queue:**
- Option A: Regenerate with same archetype only
- Option B: Show weakness reason + let admin add a hint before regenerating
- **Recommended:** Option A for v1 — simpler, good enough

**2. Admin authentication:**
- Option A: Single hardcoded password in .env
- Option B: No auth — just keep URL secret
- **Recommended:** Option A — takes 10 minutes, worth having

**3. Question versioning:**
- If a published question is later unpublished, should old quiz sessions that already used it still show it in results? 
- **Recommended:** Yes — results are stored client-side, no lookup needed

**4. How many questions before launching quiz:**
- Minimum viable: 60 questions (6 complete non-repeat sessions)
- Comfortable: 150 questions (15 sessions)
- Full bank: 300 questions (30 sessions)
- **Recommended:** Launch at 150, grow to 300

---

## Part 9 — Environment Variables Needed

Add to admin tool's `.env.local`:

```bash
ANTHROPIC_API_KEY=same_as_main_app
NEXT_PUBLIC_SUPABASE_URL=same_as_main_app
NEXT_PUBLIC_SUPABASE_ANON_KEY=same_as_main_app
SUPABASE_SERVICE_ROLE_KEY=same_as_main_app
ADMIN_PASSWORD=choose_a_strong_password
```

---

## Notes

- The quiz page and admin tool share the same Supabase database but are separate deployments
- The no-repeat system (lib/quiz-memory.ts) is already built in the main BimaDarpan codebase — do not rebuild it
- The quiz session API route already exists — only needs the `status = 'published'` filter added
- All quiz questions generated through the admin tool automatically appear in the quiz with no code changes needed
- When real data shows which archetypes users struggle with most, double down on generating more of those
