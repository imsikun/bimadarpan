export function formatCrore(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L Cr`;
  if (value >= 1000)   return `₹${(value / 1000).toFixed(1)}K Cr`;
  return `₹${value.toFixed(0)} Cr`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatLakh(value: number): string {
  return `₹${value}L`;
}

export function getSignalColor(metric: 'penetration' | 'settlement' | 'claim', value: number): string {
  const thresholds = {
    penetration: { excellent: 30, good: 20, warning: 10 },
    settlement:  { excellent: 95, good: 85, warning: 70 },
    claim:       { excellent: 80, good: 60, warning: 40 },
  };

  const t = thresholds[metric];
  if (value >= t.excellent) return 'var(--data-excellent)';
  if (value >= t.good)      return 'var(--data-good)';
  if (value >= t.warning)   return 'var(--data-warning)';
  return 'var(--data-poor)';
}

export function slugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
