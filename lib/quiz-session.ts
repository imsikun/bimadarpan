import { buildSeenParam, markSeen, resetMemory } from './quiz-memory';

export async function fetchQuizSession(stateName?: string, contextHint?: string) {
  const isPhase2 = process.env.NEXT_PUBLIC_PHASE === '2';

  // Phase 2: try personalised first
  if (isPhase2 && stateName) {
    try {
      const res = await fetch('/api/quiz/personalised', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state_name: stateName, context_hint: contextHint, count: 10 }),
      });
      if (res.ok) {
        const data = await res.json();
        markSeen(data.questions.map((q: any) => q.id || 0));
        return data;
      }
    } catch {
      // Fall through to static bank silently
    }
  }

  // Phase 1 (default): static bank, always works, always free
  const seenParam = buildSeenParam();
  const url = `/api/quiz/session${seenParam ? `?seen=${seenParam}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.reset) resetMemory();
  markSeen(data.questions.map((q: any) => q.id));
  return data;
}
