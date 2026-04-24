import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = 20;

  let query = supabase
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
