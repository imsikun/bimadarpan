'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

interface OptionButtonProps {
  text: string;
  state: OptionState;
  onClick: () => void;
  disabled?: boolean;
}

const STATE_STYLES: Record<OptionState, { background: string; borderColor: string }> = {
  idle:     { background: 'var(--bg-data)',    borderColor: 'var(--border-subtle)' },
  selected: { background: 'var(--saffron-dim)', borderColor: 'var(--saffron)' },
  correct:  { background: 'var(--bg-data)',    borderColor: 'var(--teal)' },
  wrong:    { background: 'var(--bg-data)',    borderColor: 'var(--red-alert)' },
};

export default function OptionButton({ text, state, onClick, disabled }: OptionButtonProps) {
  const s = STATE_STYLES[state];
  const isAnswered = state === 'correct' || state === 'wrong';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isAnswered}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 'var(--space-5)',
        background: s.background,
        border: `1px solid ${s.borderColor}`,
        borderRadius: 'var(--radius-lg)',
        transition: 'border-color var(--dur-fast) var(--ease-default), background var(--dur-fast)',
        cursor: disabled || isAnswered ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar — correct only */}
      {state === 'correct' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: 3,
            background: 'var(--teal)',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: state === 'correct' ? 'var(--space-3)' : 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: state === 'selected' ? 600 : 500,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}
        >
          {text}
        </span>

        {/* Right indicator */}
        {state === 'idle' && (
          <div
            style={{
              width: 20, height: 20, flexShrink: 0,
              borderRadius: '50%',
              border: '1px solid var(--border-strong)',
            }}
          />
        )}
        {state === 'selected' && (
          <div
            style={{
              width: 20, height: 20, flexShrink: 0,
              borderRadius: '50%',
              border: '2px solid var(--saffron)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--saffron)' }} />
          </div>
        )}
        {state === 'correct' && <CheckCircle2 size={20} strokeWidth={1.5} color="var(--teal)" />}
        {state === 'wrong'   && <XCircle      size={20} strokeWidth={1.5} color="var(--red-alert)" />}
      </div>
    </button>
  );
}
