import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('state_metrics')
    .select('*, states (slug, name, region)')
    .eq('fiscal_year', 'FY25')
    .order('penetration_pct', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
