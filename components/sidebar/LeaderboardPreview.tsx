import { StateWithMetrics } from '@/types';

interface LeaderboardPreviewProps {
  states?: StateWithMetrics[];
}

interface BarRow {
  name: string;
  pct: number;
}

const PLACEHOLDER_ROWS: BarRow[] = [
  { name: 'Maharashtra', pct: 31.2 },
  { name: 'Kerala',      pct: 27.3 },
  { name: 'Karnataka',   pct: 24.5 },
  { name: 'Gujarat',     pct: 21.2 },
  { name: 'Bihar',       pct:  9.8 },
];

const ROW_VALUE_WIDTHS = ['48px', '64px', '40px', '56px', '80px'];

export function LeaderboardPreviewSkeleton() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div className="skeleton" style={{ height: 20, width: 120, borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: 16, width: 16, borderRadius: 'var(--radius-sm)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {ROW_VALUE_WIDTHS.map((valW, i) => (
          <div
            key={i}
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: '0 var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            }}
          >
            <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
            <div className="skeleton" style={{ flex: 1, height: 12, borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton" style={{ width: valW, height: 16, borderRadius: 'var(--radius-full)' }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: 96, width: '100%', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="skeleton" style={{ flex: 1, height: 40, borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ flex: 1, height: 40, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    </div>
  );
}

function barColor(pct: number): string {
  if (pct >= 28) return 'var(--data-excellent)';
  if (pct >= 20) return 'var(--data-good)';
  if (pct >= 12) return 'var(--data-warning)';
  return 'var(--data-poor)';
}

export default function LeaderboardPreview({ states }: LeaderboardPreviewProps) {
  const rows: BarRow[] =
    states && states.length > 0
      ? states
          .filter((s) => s.metrics)
          .sort((a, b) => (b.metrics!.penetration_pct - a.metrics!.penetration_pct))
          .slice(0, 5)
          .map((s) => ({ name: s.name, pct: s.metrics!.penetration_pct }))
      : PLACEHOLDER_ROWS;

  const maxPct = Math.max(...rows.map((r) => r.pct));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {rows.map((row) => {
        const color = barColor(row.pct);
        return (
          <div key={row.name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {row.name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color,
                }}
              >
                {row.pct.toFixed(1)}%
              </span>
            </div>

            {/* Bar track */}
            <div
              style={{
                height: 6,
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(row.pct / maxPct) * 100}%`,
                  background: color,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width var(--dur-slow) var(--ease-smooth)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
