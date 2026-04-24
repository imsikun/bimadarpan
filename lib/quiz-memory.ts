const STORAGE_KEY = 'bimadarpan_seen_q';

export function getSeenIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markSeen(ids: number[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSeenIds();
    const updated = [...new Set([...current, ...ids])].slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full or blocked — fail silently
  }
}

export function resetMemory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function buildSeenParam(): string {
  return getSeenIds().join(',');
}
