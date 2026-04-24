import Link from 'next/link';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { StateWithMetrics } from '@/types';

interface StatePanelProps {
  state: StateWithMetrics | null;
}

const LEADING_TYPE_LABELS: Record<string, string> = {
  life: 'Life',
  health: 'Health',
  motor: 'Motor',
  general: 'General',
};

export default function StatePanel({ state }: StatePanelProps) {
  if (!state || !state.metrics) return <EmptyState />;
  return <SelectedState state={state as StateWithMetrics & { metrics: NonNullable<StateWithMetrics['metrics']> }} />;
}

function EmptyState() {
  return (
    <div
      style={{
        padding: 'var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <MapPin size={28} strokeWidth={1.5} color="var(--text-muted)" />
      </div>
      <h4
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-base)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Select a state to explore
      </h4>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          padding: '0 var(--space-4)',
        }}
      >
        Click any state on the map to see its specific intelligence data.
      </p>
    </div>
  );
}

function SelectedState({ state }: { state: StateWithMetrics & { metrics: NonNullable<StateWithMetrics['metrics']> } }) {
  const m = state.metrics;

  const metrics = [
    { label: 'Penetration',  value: `${m.penetration_pct.toFixed(1)}%`, color: getPenetrationColor(m.penetration_pct) },
    { label: 'Settlement',   value: `${m.settlement_ratio_pct.toFixed(1)}%`, color: getSettlementColor(m.settlement_ratio_pct) },
    { label: 'Claim Ratio',  value: `${m.claim_ratio_pct.toFixed(1)}%`, color: 'var(--text-secondary)' },
    { label: 'Leading Type', value: LEADING_TYPE_LABELS[m.leading_type] ?? m.leading_type, color: 'var(--teal)' },
  ];

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        animation: 'slide-in-right 250ms var(--ease-default) both',
      }}
    >
      {/* State header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {state.name}
          </h4>
          <span
            style={{
              padding: '2px 10px',
              background: 'var(--saffron-dim)',
              border: '1px solid var(--saffron-border)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--saffron)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {state.region}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          {m.fiscal_year} · {m.data_type}
        </p>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              background: 'var(--bg-data)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              {metric.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: metric.color,
              }}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {/* Top insurer */}
      {m.top_insurer && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Top Insurer
          </span>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
            {m.top_insurer}
          </p>
        </div>
      )}

      {/* View full profile */}
      <Link
        href={`/state/${state.slug}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          background: 'var(--saffron-dim)',
          border: '1px solid var(--saffron-border)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--saffron)',
          textDecoration: 'none',
          transition: 'background var(--dur-fast)',
        }}
      >
        View Full Profile
        <ArrowUpRight size={14} strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function getPenetrationColor(pct: number): string {
  if (pct >= 28) return 'var(--data-excellent)';
  if (pct >= 20) return 'var(--data-good)';
  if (pct >= 12) return 'var(--data-warning)';
  return 'var(--data-poor)';
}

function getSettlementColor(pct: number): string {
  if (pct >= 95) return 'var(--data-excellent)';
  if (pct >= 85) return 'var(--data-good)';
  if (pct >= 75) return 'var(--data-warning)';
  return 'var(--data-poor)';
}
