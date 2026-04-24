import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric') ?? 'penetration_pct';

  const validMetrics = ['penetration_pct', 'premium_cr', 'claim_ratio_pct', 'settlement_ratio_pct'];
  const orderBy = validMetrics.includes(metric) ? metric : 'penetration_pct';

  const { data, error } = await supabase
    .from('state_metrics')
    .select('*, states (slug, name, region)')
    .eq('fiscal_year', 'FY25')
    .order(orderBy, { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
