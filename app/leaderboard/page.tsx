'use client';

import { useState, useEffect, useMemo } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortMetric = 'penetration_pct' | 'settlement_ratio_pct' | 'premium_cr';

interface BaseRow {
  state_slug:           string;
  name:                 string;
  region:               string;
  penetration_pct:      number;
  settlement_ratio_pct: number;
  premium_cr:           number;
  top_insurer:          string;
  leading_type:         string;
  majority_category:    string;
}

interface LeaderboardRow extends BaseRow {
  rank: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { metric: SortMetric; label: string }[] = [
  { metric: 'penetration_pct',      label: 'Penetration' },
  { metric: 'settlement_ratio_pct', label: 'Settlement'  },
  { metric: 'premium_cr',           label: 'Premium'     },
];

const COLUMNS = [
  { label: '#',           w: 60  },
  { label: 'STATE',       w: 0   },
  { label: 'PENETRATION', w: 200 },
  { label: 'SETTLEMENT',  w: 130 },
  { label: 'PREMIUM',     w: 120 },
  { label: 'TOP INSURER', w: 140 },
  { label: 'TYPE',        w: 100 },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  const configs = [
    { bg: 'rgba(255,153,51,0.15)',  border: 'rgba(255,153,51,0.30)',  color: 'var(--saffron)' },
    { bg: 'rgba(0,212,170,0.12)',   border: 'rgba(0,212,170,0.20)',   color: 'var(--teal)'    },
    { bg: 'rgba(124,111,255,0.12)', border: 'rgba(124,111,255,0.20)', color: 'var(--purple)'  },
  ];
  const c = rank <= 3 ? configs[rank - 1] : null;
  return (
    <div style={{
      width: 32, height: 32,
      borderRadius: 'var(--radius-sm)',
      background:   c?.bg     ?? 'transparent',
      border:       c ? `1px solid ${c.border}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize:   rank <= 3 ? 14 : 13,
      fontWeight: rank <= 3 ? 700 : 500,
      color:      c?.color ?? 'var(--text-muted)',
    }}>
      {rank}
    </div>
  );
}

function formatPremium(cr: number) {
  if (cr >= 10000) return `₹${(cr / 1000).toFixed(0)}K`;
  if (cr >= 1000)  return `₹${(cr / 1000).toFixed(1)}K`;
  return `₹${cr.toLocaleString('en-IN')}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [allRows,      setAllRows]      = useState<BaseRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [sortMetric,   setSortMetric]   = useState<SortMetric>('penetration_pct');
  const [regionFilter, setRegionFilter] = useState('All');
  const [regions,      setRegions]      = useState<string[]>([]);
  const [page,         setPage]         = useState(1);

  // Fetch once — all sorting is client-side
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        const shaped: BaseRow[] = (data ?? []).map((row: any) => ({
          state_slug:           row.state_slug           ?? row.states?.slug ?? '',
          name:                 row.states?.name         ?? row.state_slug   ?? '',
          region:               row.states?.region       ?? 'Other',
          penetration_pct:      row.penetration_pct      ?? 0,
          settlement_ratio_pct: row.settlement_ratio_pct ?? 0,
          premium_cr:           row.premium_cr           ?? 0,
          top_insurer:          row.top_insurer          ?? '—',
          leading_type:         row.leading_type         ?? 'life',
          majority_category:    row.majority_category    ?? 'middle',
        }));
        setAllRows(shaped);
        setRegions(Array.from(new Set(shaped.map(r => r.region))).sort());
      })
      .catch(() => setError('Could not load leaderboard data.'))
      .finally(() => setLoading(false));
  }, []);

  // Client-side sort + assign ranks
  const sorted = useMemo<LeaderboardRow[]>(() =>
    [...allRows]
      .sort((a, b) => b[sortMetric] - a[sortMetric])
      .map((row, i) => ({ ...row, rank: i + 1 })),
    [allRows, sortMetric],
  );

  const filtered = useMemo(
    () => regionFilter === 'All' ? sorted : sorted.filter(r => r.region === regionFilter),
    [sorted, regionFilter],
  );

  const maxPen = useMemo(
    () => Math.max(...allRows.map(r => r.penetration_pct), 1),
    [allRows],
  );

  function handleTabChange(metric: SortMetric) {
    setSortMetric(metric);
    setPage(1);
  }

  return (
    <main
      className="page-enter"
      style={{ paddingTop: 64, minHeight: '100vh', paddingBottom: 64 }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
          }}>
            State Insurance Leaderboard
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            marginTop: 6,
            marginBottom: 0,
            lineHeight: 1.5,
          }}>
            Ranked by insurance performance across India's states. Data: IRDAI FY24 estimates.
          </p>
        </div>

        {/* ── Metric Tab Selector ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, marginBottom: 20 }}>
          {SORT_OPTIONS.map(({ metric, label }) => {
            const active = metric === sortMetric;
            return (
              <button
                key={metric}
                onClick={() => handleTabChange(metric)}
                style={{
                  padding: '7px 18px',
                  background: active ? 'var(--saffron)' : 'rgba(255,255,255,0.06)',
                  color:      active ? '#000'           : 'rgba(255,255,255,0.50)',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all var(--dur-fast) var(--ease-default)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Region Filter ───────────────────────────────────────────────────── */}
        {regions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {['All', ...regions].map(r => {
              const active = r === regionFilter;
              return (
                <button
                  key={r}
                  onClick={() => { setRegionFilter(r); setPage(1); }}
                  style={{
                    padding: '4px 14px',
                    background: active ? 'var(--bg-overlay-md)' : 'transparent',
                    border: `1px solid ${active ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                    borderRadius: 9999,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    cursor: 'pointer',
                    transition: 'all var(--dur-fast)',
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────────────── */}
        {error && (
          <div className="error-inline" style={{ marginBottom: 20 }}>
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {COLUMNS.map(col => (
                  <th key={col.label} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                    width: col.w > 0 ? col.w : undefined,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody key={`${sortMetric}-${regionFilter}`}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: i < 7 ? '1px solid var(--border-subtle)' : 'none' }}>
                      {[32, 120, 160, 80, 70, 100, 60].map((w, j) => (
                        <td key={j} style={{ padding: '14px 16px' }}>
                          <div className="skeleton" style={{ height: 12, width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((row, idx) => (
                    <tr
                      key={row.state_slug}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        background: 'transparent',
                        transition: 'background var(--dur-fast)',
                        animation: 'fade-up 280ms var(--ease-default) both',
                        animationDelay: `${Math.min(idx * 35, 560)}ms`,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-overlay)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <RankBadge rank={row.rank} />
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {row.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {row.region}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                            fontWeight: 600, color: 'var(--saffron)',
                            minWidth: 38, textAlign: 'right',
                          }}>
                            {row.penetration_pct.toFixed(1)}%
                          </span>
                          <div style={{ flex: 1, height: 4, background: 'var(--bg-overlay)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              width: `${(row.penetration_pct / maxPen) * 100}%`,
                              height: '100%',
                              background: 'var(--saffron)',
                              borderRadius: 2,
                              opacity: 0.7,
                              transition: 'width 600ms var(--ease-smooth)',
                            }} />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600,
                          color: row.settlement_ratio_pct >= 90 ? 'var(--data-good)'    :
                                 row.settlement_ratio_pct >= 75 ? 'var(--data-warning)' :
                                 'var(--data-poor)',
                        }}>
                          {row.settlement_ratio_pct.toFixed(1)}%
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {formatPremium(row.premium_cr)}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginLeft: 3 }}>Cr</span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {row.top_insurer}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '3px 9px', borderRadius: 'var(--radius-full)',
                          fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
                          textTransform: 'capitalize', letterSpacing: '0.02em',
                          background: row.leading_type === 'life'   ? 'var(--teal-dim)'    :
                                      row.leading_type === 'health' ? 'var(--saffron-dim)' :
                                      'var(--purple-dim)',
                          color: row.leading_type === 'life'   ? 'var(--teal)'    :
                                 row.leading_type === 'health' ? 'var(--saffron)' :
                                 'var(--purple)',
                        }}>
                          {row.leading_type}
                        </span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                No states match this filter.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 24, textAlign: 'center',
          letterSpacing: '0.01em',
        }}>
          Source: IRDAI Annual Report FY24–25 · Penetration = insurance premium as % of GSDP
        </p>
      </div>
    </main>
  );
}
