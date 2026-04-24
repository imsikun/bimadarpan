import { anthropic } from '@/lib/claude';

export async function POST(request: Request) {
  const { question, stateData } = await request.json();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are BimaDarpan's insurance intelligence assistant. Answer this question about India's insurance landscape concisely and honestly.

Available data context: ${JSON.stringify(stateData)}

User question: ${question}

Rules:
- Answer in 2–4 sentences maximum
- Be specific — cite actual state names and numbers from the data
- Be honest, including about problems in the industry
- Never recommend specific products or insurers
- End with one actionable insight if relevant`,
    }],
  });

  const content = response.content[0];
  return Response.json({ answer: content.type === 'text' ? content.text : '' });
}
