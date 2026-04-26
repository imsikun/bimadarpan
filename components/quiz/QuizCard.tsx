'use client';

import { BarChart2 } from 'lucide-react';
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
const LETTER_MAP: Record<'a' | 'b' | 'c' | 'd', 'A' | 'B' | 'C' | 'D'> = { a: 'A', b: 'B', c: 'C', d: 'D' };

function resolveOptionState(
  key: 'a' | 'b' | 'c' | 'd',
  selected: 'a' | 'b' | 'c' | 'd' | null,
  result: AnswerResult | null,
): OptionState {
  if (!result) {
    if (selected === key) return 'selected';
    if (selected !== null) return 'dimmed';
    return 'idle';
  }
  if (key === result.correct_option && key === selected) return 'correct';
  if (key === selected) return 'wrong';
  if (key === result.correct_option) return 'revealed';
  return 'dimmed';
}

export default function QuizCard({
  question,
  currentIndex,
  total,
  selectedOption,
  result,
  onSelectOption,
  onNext,
}: QuizCardProps) {
  const optionText: Record<'a' | 'b' | 'c' | 'd', string> = {
    a: question.option_a,
    b: question.option_b,
    c: question.option_c,
    d: question.option_d,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Question header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 400,
            color: 'var(--text-tertiary)',
          }}
        >
          Question
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--text-tertiary)',
          }}
        >
          {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Scenario context */}
      {question.scenario_context && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderLeft: '2px solid rgba(255,255,255,0.12)',
            borderRadius: '0 6px 6px 0',
            padding: '10px 14px',
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {question.scenario_context}
          </p>
        </div>
      )}

      {/* Question text */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          margin: '0 0 20px',
        }}
      >
        {question.question}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {OPTION_KEYS.map((key) => (
          <OptionButton
            key={key}
            letter={LETTER_MAP[key]}
            text={optionText[key]}
            state={resolveOptionState(key, selectedOption, result)}
            onClick={() => onSelectOption(key)}
          />
        ))}
      </div>

      {/* Explanation card */}
      {result && (
        <div
          style={{
            background: '#111128',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: 16,
            marginTop: 12,
            animation: 'fade-up 250ms ease both',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 600,
              color: result.is_correct ? '#00D4AA' : '#FF4757',
              margin: 0,
            }}
          >
            {result.is_correct ? '✓ Correct' : '✗ Incorrect'}
          </p>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            {result.explanation}
          </p>

          {result.shock_stat && (
            <div
              style={{
                marginTop: 12,
                background: 'rgba(255,153,51,0.08)',
                borderLeft: '2px solid #FF9933',
                borderRadius: '0 6px 6px 0',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
              }}
            >
              <BarChart2 size={12} color="#FF9933" style={{ flexShrink: 0, marginTop: 2 }} />
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.70)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {result.shock_stat}
              </p>
            </div>
          )}

          <button
            onClick={onNext}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 16,
              padding: '12px 16px',
              fontSize: 14,
              borderRadius: 10,
            }}
          >
            {currentIndex + 1 < total ? 'Next question →' : 'See my results →'}
          </button>
        </div>
      )}
    </div>
  );
}
