'use client';

import { CheckCircle, XCircle } from 'lucide-react';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed' | 'dimmed';

interface OptionButtonProps {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  state: OptionState;
  onClick: () => void;
}

interface CardStyle {
  background: string;
  border: string;
  opacity?: number;
}

interface BadgeStyle {
  background: string;
  color: string;
}

function getCardStyle(state: OptionState): CardStyle {
  switch (state) {
    case 'correct':  return { background: 'rgba(0,212,170,0.06)',  border: '1px solid #00D4AA' };
    case 'wrong':    return { background: 'rgba(255,71,87,0.06)',   border: '1px solid #FF4757' };
    case 'revealed': return { background: 'rgba(0,212,170,0.04)',  border: '1px solid #00D4AA' };
    case 'dimmed':   return { background: '#111128', border: '1px solid rgba(255,255,255,0.08)', opacity: 0.45 };
    case 'selected': return { background: 'rgba(255,153,51,0.04)', border: '1px solid rgba(255,153,51,0.25)' };
    default:         return { background: '#111128', border: '1px solid rgba(255,255,255,0.08)' };
  }
}

function getBadgeStyle(state: OptionState): BadgeStyle {
  switch (state) {
    case 'correct':  return { background: '#00D4AA', color: '#000' };
    case 'wrong':    return { background: '#FF4757', color: '#fff' };
    case 'selected': return { background: 'rgba(255,153,51,0.15)', color: '#FF9933' };
    default:         return { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)' };
  }
}

export default function OptionButton({ letter, text, state, onClick }: OptionButtonProps) {
  const card = getCardStyle(state);
  const badge = getBadgeStyle(state);
  const interactive = state === 'idle';

  return (
    <button
      onClick={interactive ? onClick : undefined}
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 10,
        cursor: interactive ? 'pointer' : 'default',
        pointerEvents: interactive ? 'auto' : 'none',
        transition: 'border-color 200ms ease, background 200ms ease',
        ...card,
      }}
    >
      {/* Letter badge */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 600,
          transition: 'background 200ms ease, color 200ms ease',
          ...badge,
        }}
      >
        {letter}
      </div>

      {/* Option text */}
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 400,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {text}
      </span>

      {state === 'correct' && <CheckCircle size={16} strokeWidth={1.5} color="#00D4AA" style={{ flexShrink: 0 }} />}
      {state === 'wrong'   && <XCircle     size={16} strokeWidth={1.5} color="#FF4757" style={{ flexShrink: 0 }} />}
    </button>
  );
}
