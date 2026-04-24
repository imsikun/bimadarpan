import { anthropic } from '@/lib/claude';
import type { HealthCheckAnswers, CoverageReport } from '@/types';

export async function POST(request: Request) {
  const answers: HealthCheckAnswers = await request.json();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Analyse this Indian user's insurance situation and generate a coverage report.

User profile:
- Age: ${answers.age}
- Dependents: ${answers.dependents}
- Monthly income: ₹${answers.monthly_income * 1000}
- Has term insurance: ${answers.has_term_insurance}
- Has health insurance: ${answers.has_health_insurance}
- Health sum insured: ₹${answers.health_sum_insured} lakhs
- Has home loan: ${answers.has_home_loan}
- Has critical illness cover: ${answers.has_critical_illness_cover}
- Employer provides health cover: ${answers.employer_provides_health}

Rules:
1. Be honest and direct, not reassuring
2. Do NOT recommend specific insurers or products by name
3. Explain WHY each gap is a real risk in plain language
4. The warning should mention a specific mis-selling tactic relevant to their profile
5. Use Indian financial context (rupees, Indian health costs, etc.)
6. Score 0–100: 0 = completely unprotected, 100 = comprehensively covered

Return ONLY valid JSON, no other text:
{
  "score": 0-100,
  "grade": "poor|fair|good|excellent",
  "has": ["array of what they have covered"],
  "missing": ["array of what they are missing with brief risk explanation"],
  "recommended_health_cover": number_in_lakhs,
  "recommended_term_cover": number_in_lakhs,
  "estimated_annual_premium_min": number_in_rupees,
  "estimated_annual_premium_max": number_in_rupees,
  "warning": "specific mis-selling warning relevant to their profile",
  "summary": "2-sentence honest overview of their situation"
}`,
    }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return Response.json({ error: 'Unexpected response' }, { status: 500 });
  }

  try {
    const report: CoverageReport = JSON.parse(content.text);
    return Response.json({ report });
  } catch {
    return Response.json({ error: 'Failed to parse report' }, { status: 500 });
  }
}
