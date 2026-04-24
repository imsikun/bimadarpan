'use client';

import { ArrowRight, Info } from 'lucide-react';
import OptionButton, { OptionState } from './OptionButton';
import { QuizQuestionClient } from '@/types';

export interface AnswerResult {
  is_correct: boolean;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  shock_stat: string | null;
}

interface QuizCardProps {
  question: QuizQuestionClient;
  currentIndex: number; // 0-based
  total: number;
  selectedOption: 'a' | 'b' | 'c' | 'd' | null;
  result: AnswerResult | null;
  isSubmitting: boolean;
  onSelectOption: (option: 'a' | 'b' | 'c' | 'd') => void;
  onNext: () => void;
}

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;

function resolveOptionState(
  key: 'a' | 'b' | 'c' | 'd',
  selected: 'a' | 'b' | 'c' | 'd' | null,
  result: AnswerResult | null,
): OptionState {
  if (!result) return selected === key ? 'selected' : 'idle';
  if (key === result.correct_option) return 'correct';
  if (key === selected) return 'wrong';
  return 'idle';
}

export default function QuizCard({
  question,
  currentIndex,
  total,
  selectedOption,
  result,
  isSubmitting,
  onSelectOption,
  onNext,
}: QuizCardProps) {
  const progressPct = ((currentIndex + 1) / total) * 100;

  const optionText: Record<'a' | 'b' | 'c' | 'd', string> = {
    a: question.option_a,
    b: question.option_b,
    c: question.option_c,
    d: question.option_d,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── Progress & header ───────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-4)' }}>
          {question.scenario_context && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
              }}
            >
              Scenario: {question.scenario_context}
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--saffron)',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 0 8px rgba(255,153,51,0.5)',
              transition: 'width var(--dur-slow) var(--ease-smooth)',
            }}
          />
        </div>
      </div>

      {/* ── Question ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.45,
          }}
        >
          {question.question}
        </h1>
      </div>

      {/* ── Options ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {OPTION_KEYS.map((key) => (
          <OptionButton
            key={key}
            text={optionText[key]}
            state={resolveOptionState(key, selectedOption, result)}
            onClick={() => onSelectOption(key)}
            disabled={!!selectedOption || isSubmitting}
          />
        ))}
      </div>

      {/* ── Explanation card ────────────────────────────────────── */}
      {result && (
        <div
          style={{
            marginTop: 'var(--space-8)',
            padding: 'var(--space-6)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            animation: 'fade-up 300ms var(--ease-default) both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Info size={16} strokeWidth={1.5} color="var(--teal)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Analysis
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Shock stat callout */}
          {result.shock_stat && (
            <div
              style={{
                borderLeft: '2px solid var(--saffron)',
                background: 'var(--saffron-dim)',
                padding: 'var(--space-4)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  color: 'var(--saffron)',
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{result.shock_stat}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Next button ─────────────────────────────────────────── */}
      {result && (
        <div style={{ marginTop: 'var(--space-12)' }}>
          <button
            onClick={onNext}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: 'var(--space-4)',
              fontSize: 'var(--text-md)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 20px rgba(255,153,51,0.3)',
              gap: 'var(--space-2)',
            }}
          >
            {currentIndex + 1 < total ? 'Next Question' : 'See Results'}
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
