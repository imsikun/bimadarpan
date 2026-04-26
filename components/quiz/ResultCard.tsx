'use client';

import { useState } from 'react';
import { X, MessageCircle, Link2 } from 'lucide-react';

interface ResultCardProps {
  score: number;
  total: number;
  worstArchetype: string | null;
  wrongShockStats: string[];
  onPlayAgain: () => void;
}

interface Grade {
  label: string;
  message: string;
}

function getGrade(score: number): Grade {
  if (score <= 3) return { label: 'Novice', message: 'Most Indians score here. The industry counts on this.' };
  if (score <= 6) return { label: 'Aware',  message: 'You know more than most. The fine print still has traps.' };
  if (score <= 8) return { label: 'Smart',  message: 'You are harder to fool than most. Share this with your family.' };
  return              { label: 'Expert', message: 'You understand insurance better than most agents selling it.' };
}

const ARCHETYPE_LABELS: Record<string, string> = {
  'trap':         "situations that look safe but aren't",
  'real-number':  'the real scale of the problem',
  'agent-script': "what agents say vs what's true",
  'fine-print':   'the clauses that kill claims',
  'govt-scheme':  "free government schemes you're entitled to",
  'calculation':  'the real math behind insurance products',
};

export default function ResultCard({ score, total, worstArchetype, wrongShockStats, onPlayAgain }: ResultCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const grade     = getGrade(score);
  const shockStat = wrongShockStats[0] ?? '';
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/quiz` : 'https://bimadarpan.in/quiz';

  const ogUrl = `/api/og?score=${score}&total=${total}&grade=${encodeURIComponent(grade.label)}${shockStat ? `&stat=${encodeURIComponent(shockStat)}` : ''}`;

  const waText  = `I scored ${score}/${total} on India's toughest insurance quiz. Do you know more than me?\n\nbimadarpan.in/quiz`;
  const waUrl   = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          animation: 'fade-up 300ms ease both',
        }}
      >
        {/* ── Score ──────────────────────────────────────────────── */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 48,
              fontWeight: 700,
              color: '#FF9933',
              lineHeight: 1,
              margin: 0,
            }}
          >
            {score}{' '}
            <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 32 }}>/ {total}</span>
          </p>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '12px 0 0',
            }}
          >
            {grade.label}
          </p>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--text-secondary)',
              margin: '6px 0 0',
              lineHeight: 1.6,
            }}
          >
            {grade.message}
          </p>
        </div>

        {/* ── Weakest area ───────────────────────────────────────── */}
        {worstArchetype && ARCHETYPE_LABELS[worstArchetype] && (
          <div
            style={{
              background: '#111128',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 400,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                margin: '0 0 6px',
              }}
            >
              You struggled most with:
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {ARCHETYPE_LABELS[worstArchetype]}
            </p>
          </div>
        )}

        {/* ── Buttons ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '14px 16px',
              fontSize: 14,
              borderRadius: 10,
            }}
          >
            Share your result
          </button>
          <button
            onClick={onPlayAgain}
            className="btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '14px 16px',
              fontSize: 14,
              borderRadius: 10,
            }}
          >
            Try again
          </button>
        </div>
      </div>

      {/* ── Share modal ────────────────────────────────────────────── */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            animation: 'fade-in 200ms ease both',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#111128',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 14,
              padding: 24,
              animation: 'fade-up 250ms ease both',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Share your result
              </p>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* OG preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogUrl}
              alt="Result card preview"
              style={{
                width: '100%',
                borderRadius: 8,
                display: 'block',
                marginBottom: 16,
              }}
            />

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  fontSize: 14,
                  borderRadius: 10,
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                Share on WhatsApp
              </a>

              <button
                onClick={handleCopy}
                className="btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  fontSize: 14,
                  borderRadius: 10,
                  gap: 8,
                }}
              >
                <Link2 size={16} strokeWidth={1.5} />
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
