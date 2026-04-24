// Phase 2 — DeepSeek personalised quiz (activate after traction)
// Gate: NEXT_PUBLIC_PHASE=2 + DEEPSEEK_API_KEY set
import { deepseek } from '@/lib/deepseek';

export async function POST(request: Request) {
  const { state_name, context_hint, count = 5 } = await request.json();

  const systemPrompt = `You generate insurance quiz questions for Indian users.
Every question must have: scenario_context (1-2 sentence real scene setup), a blunt honest explanation, and a shock_stat (one India-specific data point).
Wrong options must be plausible. Correct option must not be obvious.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"question":"","scenario_context":"","option_a":"","option_b":"","option_c":"","option_d":"","correct_option":"a","explanation":"","shock_stat":"","difficulty":"easy|medium|hard","category":"","archetype":""}]`;

  const userPrompt = `Generate ${count} insurance quiz questions personalised for a user who just explored ${state_name} on an insurance data map.
Context: ${context_hint || `Focus on insurance realities specific to ${state_name}.`}`;

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);
    return Response.json({ questions, source: 'ai' });
  } catch {
    return Response.json({ error: 'fallback' }, { status: 422 });
  }
}
