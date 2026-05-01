'use client';

import { useEffect, useState } from 'react';
import {
  X, MapPin, ShieldCheck, ShieldX, AlertTriangle,
  CheckCircle, XCircle, TrendingUp, Shield, Database,
} from 'lucide-react';
import { StateWithMetrics } from '@/types';
import { getPenetrationInsight, getSettlementInsight, getPremiumInsight } from '@/lib/insights';

interface SidebarProps {
  selectedState: StateWithMetrics | null;
  allStates: StateWithMetrics[];
  onClose: () => void;
}

// ── Responsive sidebar width ──────────────────────────────────────────────────

function useSidebarWidth(): string {
  const [width, setWidth] = useState('45vw');
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1280)      setWidth('45vw');
      else if (w >= 1024) setWidth('42vw');
      else if (w >= 768)  setWidth('50vw');
      else                setWidth('45vw'); // mobile uses bottom sheet, not this panel
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
}

// ── Signal helpers ────────────────────────────────────────────────────────────

function penetrationSignal(v: number): string {
  if (v > 25) return 'var(--data-excellent)';
  if (v > 15) return 'var(--data-good)';
  if (v > 10) return 'var(--data-warning)';
  return 'var(--data-poor)';
}

function claimSignal(v: number): string {
  if (v > 80) return 'var(--data-good)';
  if (v > 60) return 'var(--data-warning)';
  return 'var(--data-poor)';
}

function settlementSignal(v: number): string {
  if (v > 85) return 'var(--data-excellent)';
  if (v > 75) return 'var(--data-good)';
  if (v > 65) return 'var(--data-warning)';
  return 'var(--data-poor)';
}


function fmtCr(cr: number): string {
  if (cr >= 100000) return `₹${(cr / 100000).toFixed(1)}L Cr`;
  if (cr >= 1000)   return `₹${(cr / 1000).toFixed(1)}K Cr`;
  return `₹${cr.toFixed(0)} Cr`;
}

const CATEGORY_LABEL: Record<string, string> = {
  poor:   'Lower income',
  middle: 'Middle income',
  rich:   'Higher income',
};

const TYPE_LABEL: Record<string, string> = {
  life:    'Life',
  health:  'Health',
  motor:   'Motor',
  general: 'General',
};

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.5px',
      color: 'rgba(255,255,255,0.30)',
      textTransform: 'uppercase',
      margin: '0 0 10px',
    }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' }} />;
}

interface BarRowProps {
  label: string;
  value: string;
  fill: number;        // 0–100
  color: string;
  visible: boolean;
}

function BarRow({ label, value, fill, color, visible }: BarRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.50)', width: 76, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 8, background: '#1E1E3C', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: visible ? `${Math.min(fill, 100)}%` : '0%',
          background: color,
          borderRadius: 3,
          transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color, width: 38, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
    </div>
  );
}

// ── Metric card (2×2 grid) ────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  progress?: number;
  sub?: string;
  insight?: string;
}

function MetricCard({ icon, value, label, color, progress, sub, insight }: MetricCardProps) {
  return (
    <div style={{
      background: '#111128',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 600, lineHeight: 1, margin: '8px 0 4px', color }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{label}</div>
      {insight && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.40)',
          lineHeight: 1.4,
          margin: '6px 0 0',
        }}>
          {insight}
        </p>
      )}
      {sub && (
        <span className="badge badge--neutral" style={{ marginTop: 6, alignSelf: 'flex-start', fontSize: 9 }}>
          {sub}
        </span>
      )}
      {progress !== undefined && (
        <div style={{ height: 4, background: '#1E1E3C', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: color, borderRadius: 2, transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonBlock({ w = '100%', h = 14, radius = 6 }: { w?: string | number; h?: number; radius?: number }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0 }} />;
}

function SidebarSkeleton() {
  return (
    <div style={{ padding: '64px 20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SkeletonBlock w="65%" h={28} radius={8} />
      <SkeletonBlock w="45%" h={14} />
      <SkeletonBlock w="80%" h={12} />
      <SkeletonBlock w="55%" h={11} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 96, borderRadius: 10 }} />
        ))}
      </div>
      <SkeletonBlock h={80} radius={10} />
      <SkeletonBlock h={60} radius={10} />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function NoData({ name }: { name: string }) {
  return (
    <div className="empty-state" style={{ marginTop: 40 }}>
      <Database size={32} strokeWidth={1.2} color="var(--text-muted)" />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
        No data for {name}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>
        IRDAI data for this state hasn&apos;t been published yet.
      </p>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({ selectedState, onClose }: SidebarProps) {
  const isOpen = !!selectedState;
  const sidebarWidth = useSidebarWidth();
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!selectedState) return;
    setShowSkeleton(true);
    const t = setTimeout(() => setShowSkeleton(false), 400);
    return () => clearTimeout(t);
  }, [selectedState?.slug]);

  const m = selectedState?.metrics ?? null;

  const penColor  = m ? penetrationSignal(m.penetration_pct)     : 'var(--text-muted)';
  const settColor = m ? settlementSignal(m.settlement_ratio_pct) : 'var(--text-muted)';

  const PenIcon  = m ? (m.penetration_pct > 20 ? ShieldCheck : m.penetration_pct > 10 ? AlertTriangle : ShieldX) : ShieldX;
  const SettIcon = m ? (m.settlement_ratio_pct > 85 ? CheckCircle : m.settlement_ratio_pct > 70 ? AlertTriangle : XCircle) : XCircle;

  const penProgress  = m ? (m.penetration_pct / 40) * 100      : 0;
  const settProgress = m ? (m.settlement_ratio_pct / 100) * 100 : 0;
  const regionLabel  = selectedState?.region ? `${selectedState.region} India` : 'India';

  const panelProps = {
    selectedState: selectedState!,
    m, penColor, settColor,
    PenIcon: <PenIcon size={16} strokeWidth={1.5} />,
    SettIcon: <SettIcon size={16} strokeWidth={1.5} />,
    penProgress, settProgress, regionLabel, onClose,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sheet-backdrop${isOpen ? ' active' : ''}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Desktop sidebar */}
      <aside
        aria-label={selectedState ? `${selectedState.name} insurance data` : 'State data panel'}
        aria-hidden={!isOpen}
        className="sidebar-desktop"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: sidebarWidth,
          zIndex: 200,
          background: '#0D0D1F',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms var(--ease-sheet)',
          boxShadow: isOpen ? '-20px 0 48px rgba(0,0,0,0.60)' : 'none',
        }}
      >
        {isOpen && (showSkeleton ? <SidebarSkeleton /> : <PanelContent {...panelProps} />)}
      </aside>

      {/* Mobile bottom sheet */}
      <div
        className={`bottom-sheet sidebar-mobile${isOpen ? ' full' : ''}`}
        aria-hidden={!isOpen}
        style={{ zIndex: 200, background: '#0D0D1F' }}
      >
        <div className="bottom-sheet__handle" />
        {isOpen && (showSkeleton ? <SidebarSkeleton /> : <PanelContent {...panelProps} isMobile />)}
      </div>
    </>
  );
}

// ── Panel content ─────────────────────────────────────────────────────────────

interface PanelContentProps {
  selectedState: StateWithMetrics;
  m: StateWithMetrics['metrics'];
  penColor: string;
  settColor: string;
  PenIcon: React.ReactNode;
  SettIcon: React.ReactNode;
  penProgress: number;
  settProgress: number;
  regionLabel: string;
  onClose: () => void;
  isMobile?: boolean;
}

function PanelContent({
  selectedState, m,
  penColor, settColor,
  PenIcon, SettIcon,
  penProgress, settProgress,
  regionLabel, onClose, isMobile,
}: PanelContentProps) {
  // Trigger bar animations after first paint
  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ── Product mix ────────────────────────────────────────────────────────────
  const lifePct    = m && m.premium_cr > 0 ? Math.round((m.life_premium_cr   / m.premium_cr) * 100) : 0;
  const healthPct  = m && m.premium_cr > 0 ? Math.round((m.health_premium_cr / m.premium_cr) * 100) : 0;
  const motorPct   = m && m.premium_cr > 0 ? Math.round((m.motor_premium_cr  / m.premium_cr) * 100) : 0;
  const generalPct = Math.max(0, 100 - lifePct - healthPct - motorPct);

  // ── Market share estimate ──────────────────────────────────────────────────
  const topShare    = m?.top_insurer === 'LIC' ? 57 : 38;
  const othersShare = 100 - topShare;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── SECTION 1 — HEADER ────────────────────────────────────────────── */}
      <div style={{
        padding: isMobile ? '0 20px 18px' : '58px 20px 18px',
        background: '#0D0D1F',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* State name */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: 0,
            }}>
              {selectedState.name}
            </h2>

            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              <span className="badge badge--neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={9} strokeWidth={2} />
                {regionLabel}
              </span>
              {m?.fiscal_year && (
                <span className="badge badge--saffron" style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                  {m.fiscal_year}
                </span>
              )}
            </div>

            {/* Contextual insight */}
            {m && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.45)',
                margin: '10px 0 0',
              }}>
                {getPenetrationInsight(m.penetration_pct)}
              </p>
            )}

            {/* Source */}
            {m?.data_source && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                Source: {m.data_source}
              </p>
            )}
          </div>

          {/* Close button (desktop only) */}
          {!isMobile && (
            <button
              onClick={onClose}
              aria-label="Close state panel"
              style={{
                width: 28, height: 28,
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.10)',
                background: '#141428',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, marginLeft: 12,
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1E1E3C')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#141428')}
            >
              <X size={12} strokeWidth={1.5} color="var(--text-secondary)" />
            </button>
          )}
        </div>
      </div>

      {/* ── SCROLLABLE BODY ───────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 20px 24px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.15) transparent',
      }}>
        {!m ? (
          <NoData name={selectedState.name} />
        ) : (
          <>
            {/* ── SECTION 2 — OVERVIEW METRICS (2×2 grid) ─────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <MetricCard
                icon={PenIcon}
                value={`${m.penetration_pct.toFixed(1)}%`}
                label="Insurance penetration"
                color={penColor}
                progress={penProgress}
                insight={getPenetrationInsight(m.penetration_pct)}
              />
              <MetricCard
                icon={SettIcon}
                value={`${m.settlement_ratio_pct.toFixed(1)}%`}
                label="Claim settlement ratio"
                color={settColor}
                progress={settProgress}
                insight={getSettlementInsight(m.settlement_ratio_pct)}
              />
              <MetricCard
                icon={<TrendingUp size={16} strokeWidth={1.5} />}
                value={fmtCr(m.premium_cr)}
                label="Total premium collected"
                color="var(--saffron)"
                insight={getPremiumInsight(m.premium_cr)}
              />
              <MetricCard
                icon={<Shield size={16} strokeWidth={1.5} />}
                value={m.top_insurer || '—'}
                label="Leading insurer"
                color="var(--purple)"
                sub={TYPE_LABEL[m.leading_type] ?? m.leading_type}
              />
            </div>

            {/* Additional info row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <div style={{ flex: 1, background: '#111128', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Majority holders
                </p>
                <span className="badge badge--teal">{CATEGORY_LABEL[m.majority_category] ?? m.majority_category}</span>
              </div>
              <div style={{ flex: 1, background: '#111128', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Leading type
                </p>
                <span className="badge badge--saffron">{TYPE_LABEL[m.leading_type] ?? m.leading_type}</span>
              </div>
            </div>

            <Divider />

            {/* ── SECTION 3 — KEY METRICS ──────────────────────────────────── */}
            <section style={{ marginBottom: 4 }}>
              <SectionTitle>Key metrics</SectionTitle>
              <div style={{ background: '#111128', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '4px 14px' }}>
                <BarRow
                  label="Penetration"
                  value={`${m.penetration_pct.toFixed(1)}%`}
                  fill={(m.penetration_pct / 40) * 100}
                  color={penetrationSignal(m.penetration_pct)}
                  visible={barsVisible}
                />
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                <BarRow
                  label="Claim ratio"
                  value={`${m.claim_ratio_pct.toFixed(1)}%`}
                  fill={m.claim_ratio_pct}
                  color={claimSignal(m.claim_ratio_pct)}
                  visible={barsVisible}
                />
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                <BarRow
                  label="Settlement"
                  value={`${m.settlement_ratio_pct.toFixed(1)}%`}
                  fill={m.settlement_ratio_pct}
                  color={settlementSignal(m.settlement_ratio_pct)}
                  visible={barsVisible}
                />
              </div>
            </section>

            <Divider />

            {/* ── SECTION 4 — PRODUCT MIX ──────────────────────────────────── */}
            <section style={{ marginBottom: 4 }}>
              <SectionTitle>Product mix</SectionTitle>
              <div style={{ background: '#111128', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '4px 14px' }}>
                {([
                  { label: 'Life',    pct: lifePct,    color: '#7C6FFF' },
                  { label: 'Health',  pct: healthPct,  color: '#00D4AA' },
                  { label: 'Motor',   pct: motorPct,   color: '#FF9933' },
                  { label: 'General', pct: generalPct, color: '#85B7EB' },
                ] as const).map(({ label, pct, color }, i) => (
                  <div key={label}>
                    {i > 0 && <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    <BarRow
                      label={label}
                      value={`${pct}%`}
                      fill={pct}
                      color={color}
                      visible={barsVisible}
                    />
                  </div>
                ))}
              </div>
            </section>

            <Divider />

            {/* ── SECTION 5 — MARKET PLAYERS ───────────────────────────────── */}
            <section style={{ marginBottom: 4 }}>
              <SectionTitle>Market players</SectionTitle>
              <div style={{ background: '#111128', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '4px 14px' }}>

                {/* Rank 1 — top insurer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 36 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--saffron)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', width: 80, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.top_insurer || '—'}
                  </span>
                  <div style={{ flex: 1, height: 6, background: '#1E1E3C', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: barsVisible ? `${topShare}%` : '0%', background: 'var(--saffron)', borderRadius: 3, transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--saffron)', width: 34, textAlign: 'right', flexShrink: 0 }}>
                    {topShare}%
                  </span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

                {/* Others */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 36 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E2E56', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', width: 80, flexShrink: 0 }}>
                    Others
                  </span>
                  <div style={{ flex: 1, height: 6, background: '#1E1E3C', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: barsVisible ? `${othersShare}%` : '0%', background: '#2E2E56', borderRadius: 3, transition: 'width 500ms cubic-bezier(0.4,0,0.2,1) 80ms' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', width: 34, textAlign: 'right', flexShrink: 0 }}>
                    {othersShare}%
                  </span>
                </div>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', margin: '7px 0 0', lineHeight: 1.5 }}>
                * Market share estimated. State-level insurer data pending IRDAI publication.
              </p>
            </section>

          </>
        )}
      </div>
    </div>
  );
}
