'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import QuizCard, { AnswerResult } from '@/components/quiz/QuizCard';
import ResultCard from '@/components/quiz/ResultCard';
import { QuizQuestionClient } from '@/types';
import { buildSeenParam, markSeen, resetMemory } from '@/lib/quiz-memory';

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'loading' | 'quiz' | 'result';

interface ArchetypeScore {
  total: number;
  correct: number;
}

interface QuizSession {
  questions: QuizQuestionClient[];
  currentIdx: number;
  selectedOption: 'a' | 'b' | 'c' | 'd' | null;
  result: AnswerResult | null;
  scores: {
    correct: number;
    byArchetype: Record<string, ArchetypeScore>;
  };
  wrongShockStats: string[];
  isSubmitting: boolean;
}

const EMPTY_SESSION: QuizSession = {
  questions: [],
  currentIdx: 0,
  selectedOption: null,
  result: null,
  scores: { correct: 0, byArchetype: {} },
  wrongShockStats: [],
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
      const seenParam = buildSeenParam();
      const url = `/api/quiz/session${seenParam ? `?seen=${seenParam}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load questions');
      const { questions, reset } = await res.json();
      if (!questions || questions.length === 0) throw new Error('No questions available');
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
      const archetype = question.archetype;
      setSession(s => {
        const prev = s.scores.byArchetype[archetype] ?? { total: 0, correct: 0 };
        const wrongShockStats =
          !result.is_correct && result.shock_stat
            ? [...s.wrongShockStats, result.shock_stat]
            : s.wrongShockStats;
        return {
          ...s,
          result,
          isSubmitting: false,
          wrongShockStats,
          scores: {
            correct: s.scores.correct + (result.is_correct ? 1 : 0),
            byArchetype: {
              ...s.scores.byArchetype,
              [archetype]: {
                total: prev.total + 1,
                correct: prev.correct + (result.is_correct ? 1 : 0),
              },
            },
          },
        };
      });
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

  // ── Derive worst archetype: lowest correct/total ratio ───────────────────
  const worstArchetype: string | null = (() => {
    const entries = Object.entries(session.scores.byArchetype);
    if (entries.length === 0) return null;
    const withRatio = entries
      .filter(([, s]) => s.total > 0 && s.correct < s.total)
      .map(([arch, s]) => ({ arch, ratio: s.correct / s.total }));
    if (withRatio.length === 0) return null;
    return withRatio.sort((a, b) => a.ratio - b.ratio)[0].arch;
  })();

  // ────────────────────────────────────────────────────────────────────────────

  if (phase === 'intro') return <IntroScreen onStart={startSession} error={error} />;
  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'result') {
    return (
      <main
        className="page-enter"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          <ResultCard
            score={session.scores.correct}
            total={session.questions.length}
            worstArchetype={worstArchetype}
            wrongShockStats={session.wrongShockStats}
            onPlayAgain={startSession}
          />
        </div>
      </main>
    );
  }

  const current = session.questions[session.currentIdx];
  const progressPct = (session.currentIdx / session.questions.length) * 100;

  return (
    <>
      {/* Full-width progress bar — sits right below fixed nav */}
      <div
        style={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255,255,255,0.08)',
          zIndex: 99,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: '#FF9933',
            transition: 'width 300ms ease',
          }}
        />
      </div>

      <main className="page-enter" style={{ paddingTop: 88, minHeight: '100vh' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '24px 24px 80px' }}>
          <button
            onClick={() => { setPhase('intro'); setSession(EMPTY_SESSION); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              marginBottom: 24,
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 400,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back
          </button>

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
    </>
  );
}

// ── Intro screen ─────────────────────────────────────────────────────────────
function IntroScreen({ onStart, error }: { onStart: () => void; error: string | null }) {
  return (
    <main
      className="aurora-bg page-enter"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--space-6)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Insurance Reality Check
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Do you really know insurance?
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            fontWeight: 400,
            color: 'var(--text-secondary)',
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          10 questions. Real situations. Uncomfortable truths.
        </p>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            marginTop: 4,
          }}
        >
          ~ 4 minutes
        </p>

        {error && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red-alert)', marginTop: 'var(--space-4)' }}>
            {error}
          </p>
        )}

        <button
          onClick={onStart}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            fontSize: 15,
            borderRadius: 'var(--radius-lg)',
            marginTop: 32,
          }}
        >
          Start the quiz →
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
