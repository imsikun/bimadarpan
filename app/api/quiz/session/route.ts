import { supabase } from '@/lib/supabase';
import type { QuizQuestionClient } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seen = searchParams.get('seen');
  const seenIds: number[] = seen
    ? seen.split(',').map(Number).filter(n => !isNaN(n))
    : [];

  const selectFields = 'id, question, scenario_context, option_a, option_b, option_c, option_d, explanation, shock_stat, difficulty, category, archetype';

  let query = supabase.from('quiz_questions').select(selectFields);
  if (seenIds.length > 0) {
    query = query.not('id', 'in', `(${seenIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (!data || data.length < 10) {
    const { data: fresh, error: freshError } = await supabase
      .from('quiz_questions')
      .select(selectFields);

    if (freshError || !fresh) {
      return Response.json({ error: 'Failed to load questions' }, { status: 500 });
    }

    const selected = pickBalanced(fresh);
    return Response.json({ questions: selected, reset: true, session_id: crypto.randomUUID() });
  }

  const selected = pickBalanced(data);
  return Response.json({ questions: selected, reset: false, session_id: crypto.randomUUID() });
}

function pickBalanced(pool: QuizQuestionClient[]): QuizQuestionClient[] {
  const archetypes = ['trap', 'real-number', 'agent-script', 'fine-print', 'govt-scheme', 'calculation'];
  const byArchetype: Record<string, QuizQuestionClient[]> = {};

  for (const q of pool) {
    const arch = (q as { archetype?: string }).archetype ?? 'trap';
    if (!byArchetype[arch]) byArchetype[arch] = [];
    byArchetype[arch].push(q);
  }

  const selected: QuizQuestionClient[] = [];
  const usedIds = new Set<number>();

  for (const arch of archetypes) {
    const available = (byArchetype[arch] ?? []).filter(q => !usedIds.has(q.id));
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      selected.push(pick);
      usedIds.add(pick.id);
    }
  }

  const remaining = pool
    .filter(q => !usedIds.has(q.id))
    .sort(() => Math.random() - 0.5);

  selected.push(...remaining.slice(0, 10 - selected.length));
  return selected.sort(() => Math.random() - 0.5);
}
