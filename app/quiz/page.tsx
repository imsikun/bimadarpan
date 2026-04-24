'use client';

import { useState, useCallback } from 'react';
import { Brain } from 'lucide-react';
import QuizCard, { AnswerResult } from '@/components/quiz/QuizCard';
import ResultCard from '@/components/quiz/ResultCard';
import { QuizQuestionClient } from '@/types';

// ── localStorage helpers (inline — no lib dependency yet) ────────────────────
const STORAGE_KEY = 'bimadarpan_seen_q';

function getSeenIds(): number[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

function markSeen(ids: number[]) {
  try {
    const updated = [...new Set([...getSeenIds(), ...ids])].slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* localStorage full — fail silently */ }
}

function resetMemory() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ── Grade / archetype tracking ───────────────────────────────────────────────
type Phase = 'intro' | 'loading' | 'quiz' | 'result';

interface QuizSession {
  questions: QuizQuestionClient[];
  currentIdx: number;
  selectedOption: 'a' | 'b' | 'c' | 'd' | null;
  result: AnswerResult | null;
  score: number;
  wrongArchetypes: string[];
  isSubmitting: boolean;
}

const EMPTY_SESSION: QuizSession = {
  questions: [],
  currentIdx: 0,
  selectedOption: null,
  result: null,
  score: 0,
  wrongArchetypes: [],
  isSubmitting: false,
};

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [session, setSession] = useState<QuizSession>(EMPTY_SESSION);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch a new batch of questions ────────────────────────────────────────
  const startSession = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const seen = getSeenIds();
      const url = `/api/quiz/session${seen.length ? `?seen=${seen.join(',')}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load questions');
      const { questions, reset } = await res.json();
      if (reset) resetMemory();
      markSeen(questions.map((q: QuizQuestionClient) => q.id));
      setSession({ ...EMPTY_SESSION, questions });
      setPhase('quiz');
    } catch {
      setError('Could not load quiz questions. Please try again.');
      setPhase('intro');
    }
  }, []);

  // ── Handle option selection → auto-submit ─────────────────────────────────
  const handleSelectOption = useCallback(async (option: 'a' | 'b' | 'c' | 'd') => {
    setSession(s => ({ ...s, selectedOption: option, isSubmitting: true }));
    try {
      const question = session.questions[session.currentIdx];
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id, selected_option: option }),
      });
      const result: AnswerResult = await res.json();
      setSession(s => ({
        ...s,
        result,
        isSubmitting: false,
        score: result.is_correct ? s.score + 1 : s.score,
        wrongArchetypes: !result.is_correct
          ? [...s.wrongArchetypes, question.archetype]
          : s.wrongArchetypes,
      }));
    } catch {
      setSession(s => ({ ...s, isSubmitting: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.questions, session.currentIdx]);

  // ── Advance to next question or result screen ─────────────────────────────
  const handleNext = useCallback(() => {
    setSession(s => {
      const isLast = s.currentIdx + 1 >= s.questions.length;
      if (isLast) {
        setPhase('result');
        return s;
      }
      return { ...s, currentIdx: s.currentIdx + 1, selectedOption: null, result: null };
    });
  }, []);

  // ── Derive worst archetype from wrong answers ─────────────────────────────
  const worstArchetype: string | null = (() => {
    if (session.wrongArchetypes.length === 0) return null;
    const counts = session.wrongArchetypes.reduce<Record<string, number>>(
      (acc, a) => ({ ...acc, [a]: (acc[a] ?? 0) + 1 }),
      {},
    );
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  })();

  // ────────────────────────────────────────────────────────────────────────────

  if (phase === 'intro') return <IntroScreen onStart={startSession} error={error} />;
  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'result') {
    return (
      <main className="page-enter" style={{ paddingTop: 100, minHeight: '100vh' }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '0 var(--space-6)' }}>
          <ResultCard
            score={session.score}
            total={session.questions.length}
            worstArchetype={worstArchetype}
            onPlayAgain={startSession}
          />
        </div>
      </main>
    );
  }

  const current = session.questions[session.currentIdx];
  return (
    <main className="page-enter" style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 672, margin: '0 auto', padding: 'var(--space-12) var(--space-6) var(--space-20)' }}>
        <QuizCard
          question={current}
          currentIndex={session.currentIdx}
          total={session.questions.length}
          selectedOption={session.selectedOption}
          result={session.result}
          isSubmitting={session.isSubmitting}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
        />
      </div>
    </main>
  );
}

// ── Intro screen ─────────────────────────────────────────────────────────────
function IntroScreen({ onStart, error }: { onStart: () => void; error: string | null }) {
  return (
    <main className="page-enter" style={{ paddingTop: 100, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: 'var(--space-12) var(--space-6)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        <div
          style={{
            width: 64, height: 64,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--saffron-dim)',
            border: '1px solid var(--saffron-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Brain size={28} strokeWidth={1.5} color="var(--saffron)" />
        </div>

        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 'var(--space-4)',
            }}
          >
            Do you really know insurance?
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            10 questions. Real scenarios. Uncomfortable truths.
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            ~4 minutes
          </p>
        </div>

        {error && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--red-alert)' }}>{error}</p>
        )}

        <button
          onClick={onStart}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 24px rgba(255,153,51,0.25)',
          }}
        >
          Start the quiz
        </button>
      </div>
    </main>
  );
}

// ── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <main style={{ paddingTop: 100, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 40, height: 40,
            border: '2px solid var(--border-default)',
            borderTopColor: 'var(--saffron)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto var(--space-4)',
          }}
        />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Loading questions…
        </p>
      </div>
    </main>
  );
}
