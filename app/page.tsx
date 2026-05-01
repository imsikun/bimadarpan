'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import Sidebar from '@/components/sidebar/Sidebar';
import IndiaMap, { ColorLayer, IndiaMapHandle } from '@/components/map/IndiaMap';
import MapControls, { InsuranceType } from '@/components/map/MapControls';
import SmallStatesInset from '@/components/map/SmallStatesInset';
import StateTooltip from '@/components/map/StateTooltip';
import { StateWithMetrics } from '@/types';
import { SLUG_TO_STATE } from '@/lib/constants';

// ── Legend config per layer ───────────────────────────────────────────────────

const LEGEND_CONFIGS: Partial<Record<ColorLayer, {
  title: string;
  rows: { color: string; range: string; label: string }[];
  footer: string;
}>> = {
  penetration: {
    title: 'Penetration',
    rows: [
      { color: '#FF9933', range: '35%+',   label: 'Excellent' },
      { color: '#7040C8', range: '30–35%', label: 'Good'      },
      { color: '#5530B0', range: '25–30%', label: 'Average'   },
      { color: '#3D2090', range: '20–25%', label: 'Below avg' },
      { color: '#2A1A7A', range: '15–20%', label: 'Low'       },
      { color: '#1E1260', range: '10–15%', label: 'Very low'  },
      { color: '#0D0A2A', range: '< 10%',  label: 'Critical'  },
    ],
    footer: 'Source: IRDAI FY24 estimate',
  },
  settlement: {
    title: 'Settlement Ratio',
    rows: [
      { color: '#FF9933', range: '90%+',   label: 'Excellent' },
      { color: '#7040C8', range: '85–90%', label: 'Good'      },
      { color: '#5530B0', range: '80–85%', label: 'Average'   },
      { color: '#3D2090', range: '75–80%', label: 'Below avg' },
      { color: '#2A1A7A', range: '70–75%', label: 'Low'       },
      { color: '#1E1260', range: '65–70%', label: 'Very low'  },
      { color: '#0D0A2A', range: '< 65%',  label: 'Critical'  },
    ],
    footer: 'Source: IRDAI FY24 estimate',
  },
};

// ─────────────────────────────────────────────────────────────────────────────

interface TooltipState {
  x: number;
  y: number;
  slug: string;
  name: string;
}

export default function HomePage() {
  const [statesData, setStatesData]       = useState<StateWithMetrics[]>([]);
  const [selectedState, setSelectedState] = useState<StateWithMetrics | null>(null);
  const [selectedSlug, setSelectedSlug]   = useState<string | null>(null);
  const [colorLayer, setColorLayer]       = useState<ColorLayer>('penetration');
  const [activeType, setActiveType]       = useState<InsuranceType>('All');
  const [tooltip, setTooltip]             = useState<TooltipState | null>(null);
  const [mapLoading, setMapLoading]       = useState(true);
  const [hasSelectedState, setHasSelectedState] = useState(false);

  const mapRef      = useRef<IndiaMapHandle>(null);
  const mapPanelRef = useRef<HTMLDivElement>(null);

  // ── Fetch state data ────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/states')
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shaped: StateWithMetrics[] = data.map((row: any) => ({
          id:     row.states?.id ?? row.id,
          slug:   row.state_slug ?? row.states?.slug,
          name:   row.states?.name,
          region: row.states?.region,
          metrics: {
            id:                   row.id,
            state_slug:           row.state_slug,
            fiscal_year:          row.fiscal_year,
            penetration_pct:      row.penetration_pct      ?? 0,
            premium_cr:           row.premium_cr           ?? 0,
            total_policies:       row.total_policies       ?? 0,
            life_premium_cr:      row.life_premium_cr      ?? 0,
            health_premium_cr:    row.health_premium_cr    ?? 0,
            motor_premium_cr:     row.motor_premium_cr     ?? 0,
            claim_ratio_pct:      row.claim_ratio_pct      ?? 0,
            settlement_ratio_pct: row.settlement_ratio_pct ?? 0,
            top_insurer:          row.top_insurer          ?? '',
            leading_type:         row.leading_type         ?? 'life',
            majority_category:    row.majority_category    ?? 'middle',
            data_source:          row.data_source          ?? '',
            data_type:            row.data_type            ?? 'official',
            last_updated:         row.last_updated         ?? '',
          },
        }));
        setStatesData(shaped);
      })
      .catch(() => {})
      .finally(() => setMapLoading(false));
  }, []);

  // ── State selection ─────────────────────────────────────────────────────────

  const handleStateSelect = useCallback(
    (slug: string) => {
      let found: StateWithMetrics | null = statesData.find((s) => s.slug === slug) ?? null;

      // Fallback: state has no metrics row yet — open sidebar with NoData view
      if (!found) {
        const info = SLUG_TO_STATE[slug];
        if (info) {
          found = { id: 0, slug, name: info.name, region: info.region, metrics: null };
        }
      }

      setSelectedSlug(found ? slug : null);
      setSelectedState(found);
      if (found) setHasSelectedState(true);
    },
    [statesData],
  );

  const handleClose = useCallback(() => {
    setSelectedState(null);
    setSelectedSlug(null);
  }, []);

  // ── Zoom controls ───────────────────────────────────────────────────────────

  return (
    <main
      className="page-enter"
      style={{
        paddingTop: 64,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Map canvas (fills remaining height) ────────────────────────────── */}
      <div
        ref={mapPanelRef}
        className="glass-card"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          margin: '0 var(--space-6) var(--space-6)',
        }}
      >
        {/* Loading overlay */}
        {mapLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
              borderRadius: 'inherit',
            }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              Loading map…
            </p>
          </div>
        )}

        {/* D3 India Map */}
        <IndiaMap
          ref={mapRef}
          statesData={statesData}
          selectedSlug={selectedSlug}
          colorLayer={colorLayer}
          onStateSelect={handleStateSelect}
          onTooltipChange={setTooltip}
        />

        {/* Hover tooltip */}
        {tooltip && (
          <StateTooltip
            x={tooltip.x}
            y={tooltip.y}
            slug={tooltip.slug}
            name={tooltip.name}
            statesData={statesData}
            colorLayer={colorLayer}
          />
        )}

        {/* Click-to-explore hint — fades out permanently after first selection */}
        {!hasSelectedState && !mapLoading && (
          <p
            style={{
              position: 'absolute',
              bottom: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.30)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              margin: 0,
              animation: 'hint-pulse 3s ease-in-out infinite',
            }}
          >
            Click any state to explore
          </p>
        )}

        {/* Small states inset — bottom left, above layer controls */}
        <SmallStatesInset
          statesData={statesData}
          colorLayer={colorLayer}
          selectedSlug={selectedSlug}
          onStateSelect={handleStateSelect}
          onTooltipChange={setTooltip}
          mapContainerRef={mapPanelRef}
        />

        {/* Map controls — bottom left */}
        <MapControls
          activeLayer={colorLayer}
          activeType={activeType}
          onLayerChange={setColorLayer}
          onTypeChange={setActiveType}
        />

        {/* Zoom controls — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-6)',
            right: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          {[
            { icon: Plus,      label: 'Zoom in',    onClick: () => mapRef.current?.zoomIn() },
            { icon: Minus,     label: 'Zoom out',   onClick: () => mapRef.current?.zoomOut() },
            { icon: Maximize2, label: 'Reset zoom', onClick: () => mapRef.current?.zoomReset() },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              aria-label={label}
              title={label}
              style={{
                width: 32,
                height: 32,
                background: 'var(--bg-data)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-data)')}
            >
              <Icon size={14} strokeWidth={1.5} color="var(--text-secondary)" />
            </button>
          ))}
        </div>

        {/* Colour legend — bottom right, above zoom controls */}
        {(() => {
          const legend = LEGEND_CONFIGS[colorLayer] ?? LEGEND_CONFIGS.penetration!;
          return (
            <div
              style={{
                position: 'absolute',
                bottom: 100,
                right: 24,
                width: 180,
                background: '#0D0D1F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(255,255,255,0.30)', marginBottom: 10 }}>
                {legend.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {legend.rows.map(({ color, range, label }) => (
                  <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{range}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.30)', marginLeft: 'auto' }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                {legend.footer}
              </div>
            </div>
          );
        })()}

        {/* Ambient glows */}
        <div aria-hidden style={{ position: 'absolute', bottom: -80, left: -80, width: 240, height: 240, background: 'rgba(255,153,51,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', top: '35%', right: -80, width: 240, height: 240, background: 'rgba(0,212,170,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      </div>

      {/* ── Sidebar (fixed, slides in from right) ──────────────────────────── */}
      <Sidebar
        selectedState={selectedState}
        allStates={statesData}
        onClose={handleClose}
      />
    </main>
  );
}
