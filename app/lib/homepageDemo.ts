// Server-side fetcher for the homepage interactive phone demo. Pulls 5
// curated recipes (top of display_priority) with their full ingredient
// payload so the client component can render Tab A (cards), derive Tab B
// (shopping list) and stay deterministic across renders.
//
// Why a direct table query rather than search_public_recipes RPC: the RPC
// only returns display-shape columns (no ingredients_json) and the demo's
// Shop tab needs ingredients to derive the list. One query covers both.

import { supabasePublic, supabasePublicConfigured } from '@/lib/supabase-public';

export type DemoIngredient = {
  // canonical_name is the lowercased deduplicated form pulled from the
  // ingredients catalog — much cleaner than the raw display string.
  canonical: string;
  display: string;
};

export type DemoRecipe = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  total_minutes: number | null;
  servings: number | null;
  ingredients: DemoIngredient[];
};

const DEMO_LIMIT = 5;

type RawIngredient = {
  name?: string | null;
  canonical_name?: string | null;
  display?: string | null;
};

function normaliseIngredients(raw: unknown): DemoIngredient[] {
  if (!Array.isArray(raw)) return [];
  const out: DemoIngredient[] = [];
  for (const r of raw as RawIngredient[]) {
    if (!r || typeof r !== 'object') continue;
    const canonical = (r.canonical_name ?? r.name ?? '').toString().trim().toLowerCase();
    if (!canonical) continue;
    out.push({ canonical, display: (r.display ?? r.name ?? canonical).toString() });
  }
  return out;
}

export type DemoPantryRecipe = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  total_minutes: number | null;
};

// Pre-fetched recipes for the Pantry tab. Until the multi-param
// search_public_recipes overload (p_proteins, p_max_minutes …) ships,
// "chicken" is a stand-in: it matches the most prominent item in the
// mock pantry and produces plausible-looking results. Pre-fetched
// server-side so the client bundle stays slim (no supabase-js in the
// browser).
export async function getDemoPantryRecipes(): Promise<DemoPantryRecipe[]> {
  if (!supabasePublic || !supabasePublicConfigured) return [];
  const { data, error } = await supabasePublic.rpc('search_public_recipes', {
    p_query: 'chicken',
    p_limit: 3,
    p_offset: 0,
  });
  if (error || !Array.isArray(data)) return [];
  type Row = {
    id: string;
    slug: string;
    title: string;
    image_url: string | null;
    total_minutes: number | null;
  };
  return (data as Row[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    image_url: r.image_url ?? null,
    total_minutes: r.total_minutes ?? null,
  }));
}

export async function getDemoRecipes(): Promise<DemoRecipe[]> {
  if (!supabasePublic || !supabasePublicConfigured) return [];
  const { data, error } = await supabasePublic
    .from('recipes_published')
    .select(
      'id, slug, title, image_url, timings_json, servings, ingredients_json, display_priority',
    )
    .eq('seo_published', true)
    .is('deleted_at', null)
    .not('slug', 'is', null)
    .not('image_url', 'is', null)
    .order('display_priority', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .limit(DEMO_LIMIT);
  if (error || !data) return [];
  return data.map((r) => {
    const timings = r.timings_json as { total_minutes?: number | null } | null;
    return {
      id: r.id as string,
      slug: r.slug as string,
      title: r.title as string,
      image_url: (r.image_url as string | null) ?? null,
      total_minutes: timings?.total_minutes ?? null,
      servings: (r.servings as number | null) ?? null,
      ingredients: normaliseIngredients(r.ingredients_json),
    };
  });
}
