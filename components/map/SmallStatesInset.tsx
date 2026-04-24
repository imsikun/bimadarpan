'use client';

import { RefObject } from 'react';
import { StateWithMetrics } from '@/types';
import { ColorLayer, LAYER_SCALES, getLayerValue, TooltipState } from './IndiaMap';

interface Props {
  statesData: StateWithMetrics[];
  colorLayer: ColorLayer;
  selectedSlug: string | null;
  onStateSelect: (slug: string) => void;
  onTooltipChange: (t: TooltipState | null) => void;
  mapContainerRef: RefObject<HTMLDivElement>;
}

const INSET_STATES = [
  { code: 'DL', label: 'Delhi',        slug: 'delhi' },
  { code: 'GA', label: 'Goa',          slug: 'goa' },
  { code: 'PY', label: 'Puducherry',   slug: 'puducherry' },
  { code: 'CH', label: 'Chandigarh',   slug: 'chandigarh' },
  { code: 'DN', label: 'Dadra & NH',   slug: 'dadra-nagar-haveli' },
  { code: 'LD', label: 'Lakshadweep', slug: 'lakshadweep' },
  { code: 'AN', label: 'Andaman',      slug: 'andaman-nicobar' },
] as const;

export default function SmallStatesInset({
  statesData,
  colorLayer,
  selectedSlug,
  onStateSelect,
  onTooltipChange,
  mapContainerRef,
}: Props) {
  function getColor(slug: string): string {
    const state = statesData.find((s) => s.slug === slug);
    if (!state?.metrics) return '#0F0F20';
    return LAYER_SCALES[colorLayer](getLayerValue(state, colorLayer));
  }

  function fireTooltip(e: React.MouseEvent, item: typeof INSET_STATES[number]) {
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    onTooltipChange({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      slug: item.slug,
      name: item.label,
    });
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 24,
        width: 140,
        background: '#0D0D1F',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '10px 12px',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 8,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'rgba(255,255,255,0.25)',
          marginBottom: 8,
        }}
      >
        Small States &amp; UTs
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
        }}
      >
        {INSET_STATES.map((item) => {
          const isSelected = selectedSlug === item.slug;
          const color = getColor(item.slug);

          return (
            <div
              key={item.code}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                cursor: 'pointer',
              }}
              onClick={() => onStateSelect(item.slug)}
              onMouseEnter={(e) => fireTooltip(e, item)}
              onMouseMove={(e) => fireTooltip(e, item)}
              onMouseLeave={() => onTooltipChange(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStateSelect(item.slug);
                }
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: color,
                  border: isSelected
                    ? '1px solid rgba(255,153,51,0.90)'
                    : '1px solid rgba(255,255,255,0.15)',
                  flexShrink: 0,
                  transition: 'filter 0.08s ease, border-color 0.08s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)'; }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {item.code}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
