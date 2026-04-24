'use client';

import { ColorLayer } from './IndiaMap';

const LAYERS: { key: ColorLayer; label: string; disabled?: boolean }[] = [
  { key: 'penetration', label: 'Penetration' },
  { key: 'premium',     label: 'Premium',     disabled: true },
  { key: 'claim_ratio', label: 'Claim Ratio', disabled: true },
  { key: 'settlement',  label: 'Settlement' },
];

const TYPES = ['All', 'Life', 'Health', 'Motor', 'General'] as const;
type InsuranceType = (typeof TYPES)[number];

interface Props {
  activeLayer: ColorLayer;
  activeType: InsuranceType;
  onLayerChange: (layer: ColorLayer) => void;
  onTypeChange: (type: InsuranceType) => void;
}

export type { InsuranceType };

export default function MapControls({
  activeLayer,
  activeType,
  onLayerChange,
  onTypeChange,
}: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'var(--space-6)',
        left: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        zIndex: 10,
      }}
    >
      {/* Layer toggle */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          background: 'var(--bg-data)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
        }}
      >
        {LAYERS.map(({ key, label, disabled }) => {
          const active = !disabled && activeLayer === key;
          return (
            <button
              key={key}
              onClick={disabled ? undefined : () => onLayerChange(key)}
              title={disabled ? 'Coming soon' : undefined}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? '#000000' : 'rgba(255,255,255,0.50)',
                background: active ? '#FF9933' : 'rgba(255,255,255,0.06)',
                transition: 'all var(--dur-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Type filter */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          background: 'var(--bg-data)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
        }}
      >
        {TYPES.map((type) => {
          const active = activeType === type;
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--saffron)' : 'var(--text-tertiary)',
                background: active ? 'var(--saffron-dim)' : 'transparent',
                transition: 'all var(--dur-fast)',
              }}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
