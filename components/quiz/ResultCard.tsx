'use client';

import { Share2, RefreshCw } from 'lucide-react';

interface ResultCardProps {
  score: number;
  total: number;
  worstArchetype: string | null;
  onPlayAgain: () => void;
}

interface Grade {
  label: string;
  message: string;
  color: string;
}

function getGrade(score: number, total: number): Grade {
  const pct = score / total;
  if (pct <= 0.3) return { label: 'Novice',  color: 'var(--red-alert)',  message: 'Most Indians score here. The industry counts on this.' };
  if (pct <= 0.6) return { label: 'Aware',   color: 'var(--saffron)',    message: 'You know more than most. The fine print still has traps.' };
  if (pct <= 0.8) return { label: 'Smart',   color: 'var(--teal)',       message: "You're harder to fool than most. Share this — your family needs it." };
  return                  { label: 'Expert',  color: 'var(--teal)',       message: 'You understand insurance better than most agents selling it.' };
}

const ARCHETYPE_LABELS: Record<string, string> = {
  'trap':         'employer/group cover traps',
  'real-number':  'real-number shocks',
  'agent-script': "agent script claims",
  'fine-print':   'fine-print clauses',
  'govt-scheme':  'government scheme entitlements',
  'calculation':  'return-on-premium calculations',
};

export default function ResultCard({ score, total, worstArchetype, onPlayAgain }: ResultCardProps) {
  const grade = getGrade(score, total);

  const archetypeMsg = worstArchetype
    ? `You struggled most with ${ARCHETYPE_LABELS[worstArchetype] ?? worstArchetype} — worth a closer look.`
    : null;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/og?type=quiz&score=${score}&grade=${grade.label}`
      : '';

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'BimaDarpan Quiz', url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-12) var(--space-6)',
        animation: 'fade-up 400ms var(--ease-default) both',
      }}
    >
      {/* Score */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            color: 'var(--saffron)',
            lineHeight: 1,
            marginBottom: 'var(--space-2)',
          }}
        >
          {score} <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xl)' }}>/ {total}</span>
        </p>

        {/* Grade badge */}
        <span
          style={{
            display: 'inline-block',
            padding: '4px 16px',
            background: `color-mix(in srgb, ${grade.color} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${grade.color} 30%, transparent)`,
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: grade.color,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}
        >
          {grade.label}
        </span>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          {grade.message}
        </p>
      </div>

      {/* Archetype insight */}
      {archetypeMsg && (
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            background: 'var(--saffron-dim)',
            border: '1px solid var(--saffron-border)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: 420,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--saffron)',
              lineHeight: 1.6,
            }}
          >
            {archetypeMsg}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', width: '100%', maxWidth: 380 }}>
        <button
          onClick={handleShare}
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)' }}
        >
          <Share2 size={16} strokeWidth={1.5} />
          Share result
        </button>
        <button
          onClick={onPlayAgain}
          className="btn-ghost"
          style={{ flex: 1, justifyContent: 'center', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)' }}
        >
          <RefreshCw size={16} strokeWidth={1.5} />
          Play again
        </button>
      </div>
    </div>
  );
}
