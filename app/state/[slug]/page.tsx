import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const { data } = await supabase.from('states').select('slug');
  return (data ?? []).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from('states').select('name').eq('slug', params.slug).single();
  if (!data) return { title: 'State not found' };
  return {
    title: `Insurance in ${data.name} — Penetration, Claims & Data | BimaDarpan`,
    description: `Insurance penetration rates, claim settlement ratios, top insurers, and coverage data for ${data.name}. Updated from IRDAI FY25 official data.`,
  };
}

export default async function StatePage({ params }: { params: { slug: string } }) {
  const { data: stateData } = await supabase
    .from('state_metrics')
    .select('*, states(name, slug, region)')
    .eq('state_slug', params.slug)
    .eq('fiscal_year', 'FY25')
    .single();

  if (!stateData) notFound();

  return (
    <main className="page-enter">
      {/* State profile page — built in later step */}
      <h1>Insurance data for {(stateData as { states?: { name?: string } }).states?.name}</h1>
    </main>
  );
}
