import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { question_id, selected_option } = await request.json();

  if (!question_id || !selected_option) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('correct_option, explanation, shock_stat')
    .eq('id', question_id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Question not found' }, { status: 404 });
  }

  return Response.json({
    is_correct: data.correct_option === selected_option,
    correct_option: data.correct_option,
    explanation: data.explanation,
    shock_stat: data.shock_stat,
  });
}
