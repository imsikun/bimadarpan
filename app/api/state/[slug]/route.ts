import { supabase } from '@/lib/supabase';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabase
    .from('state_metrics')
    .select('*, states (slug, name, region)')
    .eq('state_slug', params.slug)
    .order('fiscal_year', { ascending: false })
    .limit(5);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
