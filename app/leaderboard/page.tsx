'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import StateDetailPanel from '@/components/leaderboard/StateDetailPanel';

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

const ROWS_PER_PAGE = 5;

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
  { label: '',            w: 110 },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function RankBadge({ rank, selected }: { rank: number; selected?: boolean }) {
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
      background: selected ? 'rgba(255,153,51,0.15)' : (c?.bg  ?? 'transparent'),
      border:     selected ? '1px solid rgba(255,153,51,0.30)' : (c ? `1px solid ${c.border}` : 'none'),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize:   rank <= 3 ? 14 : 13,
      fontWeight: rank <= 3 ? 700 : 500,
      color: selected ? '#FF9933' : (c?.color ?? 'var(--text-muted)'),
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
  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

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

  const searched = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? sorted.filter(r => r.name.toLowerCase().includes(q)) : sorted;
  }, [sorted, searchQuery]);

  const filtered = useMemo(
    () => regionFilter === 'All' ? searched : searched.filter(r => r.region === regionFilter),
    [searched, regionFilter],
  );

  const maxPen = useMemo(
    () => Math.max(...allRows.map(r => r.penetration_pct), 1),
    [allRows],
  );

  const pageCount = Math.ceil(filtered.length / ROWS_PER_PAGE) || 1;

  const paginated = useMemo(
    () => filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [filtered, page],
  );

  function goToPage(n: number) {
    setPage(n);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleTabChange(metric: SortMetric) {
    setSortMetric(metric);
    setPage(1);
  }

  return (
    <>
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

        {/* ── Search ─────────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <svg
            width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }}
          >
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
          <input
            type="text"
            placeholder="Search state…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              paddingLeft: 34,
              paddingRight: searchQuery ? 34 : 12,
              paddingTop: 8,
              paddingBottom: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color var(--dur-fast)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border-subtle)';  }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPage(1); }}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 16, lineHeight: 1, padding: 2,
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* ── Error ──────────────────────────────────────────────────────────── */}
        {error && (
          <div className="error-inline" style={{ marginBottom: 20 }}>
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div ref={tableRef} style={{
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

            <tbody key={`${sortMetric}-${regionFilter}-${page}`}>
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
                : paginated.map((row, idx) => {
                    const isSelected = row.state_slug === selectedSlug;
                    return (
                    <tr
                      key={row.state_slug}
                      style={{
                        borderBottom: idx < paginated.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        borderLeft: isSelected ? '3px solid #FF9933' : '3px solid transparent',
                        background: isSelected ? 'rgba(255,153,51,0.06)' : 'transparent',
                        transition: 'background var(--dur-fast), border-left var(--dur-fast)',
                        animation: 'fade-up 280ms var(--ease-default) both',
                        animationDelay: `${Math.min(idx * 35, 560)}ms`,
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-overlay)'; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 16px', paddingLeft: isSelected ? 13 : 16 }}>
                        <RankBadge rank={row.rank} selected={isSelected} />
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

                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => setSelectedSlug(
                            selectedSlug === row.state_slug ? null : row.state_slug
                          )}
                          style={{
                            padding: '5px 12px',
                            background: selectedSlug === row.state_slug
                              ? 'rgba(255,153,51,0.12)'
                              : 'transparent',
                            border: `1px solid ${selectedSlug === row.state_slug
                              ? 'rgba(255,153,51,0.35)'
                              : 'var(--border-default)'}`,
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-body)',
                            fontSize: 11,
                            fontWeight: 600,
                            color: selectedSlug === row.state_slug
                              ? 'var(--saffron)'
                              : 'var(--text-tertiary)',
                            cursor: 'pointer',
                            letterSpacing: '0.03em',
                            whiteSpace: 'nowrap',
                            transition: 'all var(--dur-fast)',
                          }}
                        >
                          {selectedSlug === row.state_slug ? 'Close ×' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                    );
                  })
              }
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                {searchQuery ? `No state found for "${searchQuery}".` : 'No states match this filter.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        {!loading && pageCount > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginTop: 16,
          }}>
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{
                padding: '7px 16px',
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                cursor: page === 1 ? 'default' : 'pointer',
                opacity: page === 1 ? 0.35 : 1,
                transition: 'opacity var(--dur-fast)',
              }}
            >
              ← Previous
            </button>

            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--text-tertiary)',
              minWidth: 90,
              textAlign: 'center',
            }}>
              Page {page} of {pageCount}
            </span>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === pageCount}
              style={{
                padding: '7px 16px',
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                cursor: page === pageCount ? 'default' : 'pointer',
                opacity: page === pageCount ? 0.35 : 1,
                transition: 'opacity var(--dur-fast)',
              }}
            >
              Next →
            </button>
          </div>
        )}

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

    <StateDetailPanel
      selectedSlug={selectedSlug}
      data={allRows}
      onClose={() => setSelectedSlug(null)}
    />
    </>
  );
}
