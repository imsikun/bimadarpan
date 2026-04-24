'use client';

import { StateWithMetrics } from '@/types';
import { ColorLayer } from './IndiaMap';

interface Props {
  x: number;
  y: number;
  slug: string;
  name: string;
  statesData: StateWithMetrics[];
  colorLayer: ColorLayer;
}

const LAYER_LABELS: Record<ColorLayer, string> = {
  penetration: 'Penetration',
  premium:     'Premium (₹Cr)',
  claim_ratio: 'Claim Ratio',
  settlement:  'Settlement',
};

function getDisplayValue(state: StateWithMetrics, layer: ColorLayer): string {
  const m = state.metrics;
  if (!m) return 'No data';
  switch (layer) {
    case 'penetration': return `${m.penetration_pct.toFixed(1)}%`;
    case 'premium':     return `₹${m.premium_cr.toLocaleString('en-IN')} Cr`;
    case 'claim_ratio': return `${m.claim_ratio_pct.toFixed(1)}%`;
    case 'settlement':  return `${m.settlement_ratio_pct.toFixed(1)}%`;
  }
}

function getValueColor(state: StateWithMetrics, layer: ColorLayer): string {
  const m = state.metrics;
  if (!m) return 'var(--text-tertiary)';
  const val = layer === 'penetration' ? m.penetration_pct
    : layer === 'settlement' ? m.settlement_ratio_pct
    : layer === 'claim_ratio' ? m.claim_ratio_pct
    : 0;
  if (val >= 30) return 'var(--data-excellent)';
  if (val >= 20) return 'var(--data-good)';
  if (val >= 10) return 'var(--data-warning)';
  return 'var(--data-poor)';
}

const OFFSET = 14;

export default function StateTooltip({ x, y, slug, name, statesData, colorLayer }: Props) {
  const state = statesData.find((s) => s.slug === slug);

  return (
    <div
      style={{
        position: 'absolute',
        left: x + OFFSET,
        top: y + OFFSET,
        pointerEvents: 'none',
        zIndex: 20,
        animation: 'fade-in 120ms var(--ease-default) both',
      }}
    >
      <div
        style={{
          background: 'rgba(17,17,40,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,153,51,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          minWidth: 160,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          {name || slug}
        </p>

        {state?.metrics ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: getValueColor(state, colorLayer),
                }}
              >
                {getDisplayValue(state, colorLayer)}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                color: 'var(--text-tertiary)',
                marginTop: 2,
              }}
            >
              {LAYER_LABELS[colorLayer]}
            </p>
            {state.metrics.top_insurer && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: 4,
                }}
              >
                Top: {state.metrics.top_insurer}
              </p>
            )}
          </>
        ) : (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>
            Data pending
          </p>
        )}
      </div>
    </div>
  );
}
