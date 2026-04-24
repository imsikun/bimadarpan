import { StateMetrics } from '@/types';

interface NationalStatsProps {
  metrics?: StateMetrics[];
}

const SKELETON_CARDS = [
  { labelW: '50%', valueW: '75%' },
  { labelW: '40%', valueW: '67%' },
  { labelW: '60%', valueW: '80%' },
  { labelW: '33%', valueW: '50%' },
];

export function NationalStatsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
      {SKELETON_CARDS.map((card, i) => (
        <div
          key={i}
          style={{
            height: 72,
            background: 'var(--bg-data)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <div className="skeleton" style={{ height: 10, width: card.labelW, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ height: 20, width: card.valueW, borderRadius: 'var(--radius-full)' }} />
        </div>
      ))}
    </div>
  );
}

interface SnapshotMetric {
  label: string;
  value: string;
}

const PLACEHOLDER_METRICS: SnapshotMetric[] = [
  { label: 'Risk Index',   value: '0.42' },
  { label: 'Penetration', value: '24.1%' },
  { label: 'Settlement',  value: '91.2%' },
  { label: 'Premiums',    value: '₹1.2T' },
];

export default function NationalStats(_: NationalStatsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
      {PLACEHOLDER_METRICS.map((m) => (
        <div
          key={m.label}
          style={{
            background: 'var(--bg-data)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
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
              marginBottom: 'var(--space-1)',
            }}
          >
            {m.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-md)',
              fontWeight: 700,
              color: 'var(--saffron)',
            }}
          >
            {m.value}
          </span>
        </div>
      ))}
    </div>
  );
}
