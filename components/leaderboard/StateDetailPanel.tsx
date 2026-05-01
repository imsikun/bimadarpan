'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  X, ShieldCheck, AlertTriangle, ShieldX,
  CheckCircle, XCircle, TrendingUp, Shield,
} from 'lucide-react';
import {
  getPenetrationInsight,
  getSettlementInsight,
  getPremiumInsight,
} from '@/lib/insights';

export interface PanelRow {
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

interface Props {
  selectedSlug: string | null;
  data:         PanelRow[];
  onClose:      () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPremium(cr: number) {
  if (cr >= 10000) return `₹${(cr / 1000).toFixed(0)}K`;
  if (cr >= 1000)  return `₹${(cr / 1000).toFixed(1)}K`;
  return `₹${cr.toLocaleString('en-IN')}`;
}

function penSignal(pct: number) {
  if (pct > 25) return 'var(--data-good)';
  if (pct > 18) return 'var(--data-warning)';
  if (pct > 10) return 'var(--saffron)';
  return 'var(--data-poor)';
}

function setSignal(pct: number) {
  if (pct >= 90) return 'var(--data-good)';
  if (pct >= 75) return 'var(--data-warning)';
  return 'var(--data-poor)';
}

function insightLine(name: string, pct: number) {
  if (pct < 10)  return `${name} is critically underinsured — fewer than 1 in 10 people have any cover.`;
  if (pct < 18)  return `${name} has significantly below-average coverage compared to the national benchmark.`;
  if (pct < 25)  return `${name} is approaching the national average but still has major coverage gaps.`;
  return `${name} is among India's better-insured states — but urban concentration masks rural gaps.`;
}

function estimatedMix(leadingType: string) {
  if (leadingType === 'life')   return { life: 55, health: 20, motor: 15, general: 10 };
  if (leadingType === 'health') return { life: 30, health: 40, motor: 20, general: 10 };
  return { life: 35, health: 25, motor: 30, general: 10 };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.08em', color: 'var(--text-muted)',
      margin: '0 0 12px',
    }}>
      {label}
    </p>
  );
}

interface MetricCardProps {
  icon:           ReactNode;
  value:          string;
  label:          string;
  valueColor:     string;
  valueFontSize?: number;
  progress?:      number;
  progressColor?: string;
  badge?:         string;
  insight?:       string;
}

function MetricCard({
  icon, value, label, valueColor,
  valueFontSize = 26, progress, progressColor, badge, insight,
}: MetricCardProps) {
  return (
    <div style={{
      background: '#111128',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
    }}>
      {/* Left — icon + big value */}
      <div style={{ flexShrink: 0, minWidth: 72 }}>
        <div style={{ marginBottom: 6 }}>{icon}</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: valueFontSize,
          fontWeight: 700,
          color: valueColor,
          lineHeight: 1,
          wordBreak: 'break-word',
        }}>
          {value}
        </div>
      </div>

      {/* Right — label, insight, progress, badge */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          marginBottom: insight ? 6 : 0,
        }}>
          {label}
        </div>
        {insight && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.40)',
            lineHeight: 1.4,
            margin: 0,
          }}>
            {insight}
          </p>
        )}
        {progress !== undefined && progressColor && (
          <div style={{
            height: 4, background: 'rgba(255,255,255,0.08)',
            borderRadius: 2, overflow: 'hidden', marginTop: 10,
          }}>
            <div style={{
              width: `${Math.min(progress, 100)}%`,
              height: '100%',
              background: progressColor,
              borderRadius: 2,
              transition: 'width 600ms var(--ease-smooth)',
            }} />
          </div>
        )}
        {badge && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)',
            fontSize: 10, fontWeight: 600,
            textTransform: 'capitalize',
            marginTop: 8,
            background: badge === 'life'   ? 'var(--teal-dim)'    :
                        badge === 'health' ? 'var(--saffron-dim)' :
                        'var(--purple-dim)',
            color:      badge === 'life'   ? 'var(--teal)'    :
                        badge === 'health' ? 'var(--saffron)' :
                        'var(--purple)',
          }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

interface BarRowProps {
  label:   string;
  value:   string;
  pct:     number;
  color:   string;
  animate: boolean;
  rank?:   number;
}

function BarRow({ label, value, pct, color, animate, rank }: BarRowProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)' }}>
          {rank != null && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--text-muted)', marginRight: 6,
            }}>
              #{rank}
            </span>
          )}
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color }}>
          {value}
        </span>
      </div>
      <div style={{
        height: 6, background: 'rgba(255,255,255,0.08)',
        borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: animate ? `${Math.min(pct, 100)}%` : '0%',
          height: '100%',
          background: color,
          borderRadius: 3,
          transition: 'width 600ms var(--ease-smooth)',
        }} />
      </div>
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function StateDetailPanel({ selectedSlug, data, onClose }: Props) {
  const [displaySlug, setDisplaySlug] = useState<string | null>(null);
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      setDisplaySlug(selectedSlug);
      requestAnimationFrame(() => requestAnimationFrame(() => setPanelOpen(true)));
    } else {
      setPanelOpen(false);
      const t = setTimeout(() => setDisplaySlug(null), 260);
      return () => clearTimeout(t);
    }
  }, [selectedSlug]);

  const row = data.find(r => r.state_slug === displaySlug) ?? null;
  if (!displaySlug || !row) return null;

  const pColor  = penSignal(row.penetration_pct);
  const sColor  = setSignal(row.settlement_ratio_pct);
  const mix     = estimatedMix(row.leading_type);
  const share   = row.top_insurer.toLowerCase().includes('lic') ? 57 : 38;

  const PenIcon = row.penetration_pct > 25 ? ShieldCheck :
                  row.penetration_pct > 10 ? AlertTriangle : ShieldX;
  const SetIcon = row.settlement_ratio_pct >= 85 ? CheckCircle :
                  row.settlement_ratio_pct >= 75 ? AlertTriangle : XCircle;

  const slideTransform = panelOpen
    ? 'translate(0, 0)'
    : isMobile ? 'translateY(100%)' : 'translateX(100%)';

  const panelPositionStyle = isMobile
    ? {
        top:       'auto' as const,
        bottom:    0,
        left:      0,
        right:     0,
        width:     '100%',
        height:    '70vh',
        borderLeft: 'none',
        borderTop: '1px solid rgba(255,255,255,0.10)',
      }
    : {
        top:       64,
        right:     0,
        bottom:    'auto' as const,
        left:      'auto' as const,
        width:     460,
        height:    'calc(100vh - 64px)' as const,
        borderLeft: '1px solid rgba(255,255,255,0.10)',
        borderTop:  'none',
      };

  return (
    <>
      {/* Mobile-only backdrop */}
      {isMobile && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 149,
            background: 'rgba(0,0,0,0.40)',
            opacity: panelOpen ? 1 : 0,
            transition: 'opacity 240ms',
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          zIndex: 150,
          background: '#0D0D1F',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.15) transparent',
          transform: slideTransform,
          transition: panelOpen
            ? 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)'
            : 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          ...panelPositionStyle,
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 20, height: 20,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.40)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
              transition: 'color var(--dur-fast)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.80)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.40)'; }}
          >
            <X size={16} />
          </button>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            paddingRight: 28,
          }}>
            {row.name}
          </h2>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 9999,
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
              color: 'var(--text-tertiary)',
            }}>
              {row.region}
            </span>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(255,153,51,0.10)',
              border: '1px solid rgba(255,153,51,0.20)',
              borderRadius: 9999,
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
              color: 'var(--saffron)',
            }}>
              FY25
            </span>
          </div>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: 'var(--text-tertiary)',
            lineHeight: 1.5, margin: 0,
          }}>
            {insightLine(row.name, row.penetration_pct)}
          </p>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 9, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.25)',
            marginTop: 8, marginBottom: 0,
          }}>
            Source: IRDAI FY24 estimate
          </p>
        </div>

        {/* ── Section 1: Overview ─────────────────────────────────────────── */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SectionLabel label="OVERVIEW" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MetricCard
              icon={<PenIcon size={14} color={pColor} />}
              value={`${row.penetration_pct.toFixed(1)}%`}
              label="Insurance penetration"
              valueColor={pColor}
              progress={(row.penetration_pct / 40) * 100}
              progressColor={pColor}
              insight={getPenetrationInsight(row.penetration_pct)}
            />
            <MetricCard
              icon={<SetIcon size={14} color={sColor} />}
              value={`${row.settlement_ratio_pct.toFixed(1)}%`}
              label="Claim settlement ratio"
              valueColor={sColor}
              progress={row.settlement_ratio_pct}
              progressColor={sColor}
              insight={getSettlementInsight(row.settlement_ratio_pct)}
            />
            <MetricCard
              icon={<TrendingUp size={14} color="var(--text-muted)" />}
              value={formatPremium(row.premium_cr)}
              label="Total premium collected"
              valueColor="var(--text-secondary)"
              insight={getPremiumInsight(row.premium_cr)}
            />
            <MetricCard
              icon={<Shield size={14} color="var(--text-muted)" />}
              value={row.top_insurer}
              label="Leading insurer"
              valueColor="var(--text-primary)"
              valueFontSize={18}
              badge={row.leading_type}
            />
          </div>
        </div>

        {/* ── Section 2: Key Metrics ──────────────────────────────────────── */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SectionLabel label="KEY METRICS" />
          <BarRow
            label="Penetration"
            value={`${row.penetration_pct.toFixed(1)}%`}
            pct={(row.penetration_pct / 40) * 100}
            color={pColor}
            animate={panelOpen}
          />
          <BarRow
            label="Claim settlement"
            value={`${row.settlement_ratio_pct.toFixed(1)}%`}
            pct={row.settlement_ratio_pct}
            color={sColor}
            animate={panelOpen}
          />
        </div>

        {/* ── Section 3: Product Mix ──────────────────────────────────────── */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SectionLabel label="PRODUCT MIX" />
          <BarRow label="Life"    value={`${mix.life}%`}    pct={mix.life}    color="#7C6FFF" animate={panelOpen} />
          <BarRow label="Health"  value={`${mix.health}%`}  pct={mix.health}  color="#00D4AA" animate={panelOpen} />
          <BarRow label="Motor"   value={`${mix.motor}%`}   pct={mix.motor}   color="#FF9933" animate={panelOpen} />
          <BarRow label="General" value={`${mix.general}%`} pct={mix.general} color="#85B7EB" animate={panelOpen} />
        </div>

        {/* ── Section 4: Market Players ───────────────────────────────────── */}
        <div style={{ padding: '16px 20px' }}>
          <SectionLabel label="MARKET PLAYERS" />
          <BarRow
            label={row.top_insurer}
            value={`${share}%`}
            pct={share}
            color="var(--saffron)"
            animate={panelOpen}
            rank={1}
          />
          <BarRow
            label="Others"
            value={`${100 - share}%`}
            pct={100 - share}
            color="rgba(255,255,255,0.20)"
            animate={panelOpen}
          />
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 10, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.25)',
            marginTop: 10, marginBottom: 0,
          }}>
            * Estimated. State-level insurer data pending.
          </p>
        </div>
      </div>
    </>
  );
}
