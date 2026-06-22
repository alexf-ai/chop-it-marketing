// Server-side data fetch for /m/<code> share-menu pages.
//
// Calls the `public.get_shared_menu(code text)` SECURITY DEFINER RPC,
// which joins shared_menus → collections → recipe_collections, resolving
// each recipe through user_recipes → recipes_published → public_recipes
// in that order. The RPC runs as postgres so RLS doesn't apply; this lets
// the marketing site stay on the anon key (no service-role secret here).
//
// Returns `null` when the share_code doesn't exist OR Supabase isn't
// configured — the route turns this into a 404.

import { supabase, supabaseConfigured } from './supabase';
import { resolveRecipeImageUrl } from './cloudflareImage';

export type SharedMenuRecipe = {
  id: string;
  title: string | null;
  // Render-ready delivery URL: resolved from the RPC's image_url, falling
  // back to a URL built from cloudflare_image_id / image_key. null only when
  // the recipe genuinely has no image.
  image_url: string | null;
  cuisine: string | null;
  servings: number | null;
  total_minutes: number | null;
  // Present for published recipes that are live on the marketing site, so
  // the tile can link to the on-site /recipes/<slug> page. null otherwise.
  slug: string | null;
  source: 'user' | 'published' | 'public' | 'unknown';
};

// Raw recipe shape as returned by the get_shared_menu RPC, before the image
// URL is resolved. cloudflare_image_id / image_key are consumed here and not
// re-exported on SharedMenuRecipe.
type RawSharedMenuRecipe = Omit<SharedMenuRecipe, 'image_url'> & {
  image_url: string | null;
  cloudflare_image_id: string | null;
  image_key: string | null;
};

export type SharedMenuPayload = {
  share_code: string;
  collection: {
    id: string;
    name: string;
    kind: string;
    created_at: string;
  };
  recipes: SharedMenuRecipe[];
};

const SHARE_CODE_RE = /^[A-Z0-9]{6,32}$/;

export function normaliseShareCode(input: string): string | null {
  const trimmed = input.trim().toUpperCase();
  return SHARE_CODE_RE.test(trimmed) ? trimmed : null;
}

export async function getSharedMenu(code: string): Promise<SharedMenuPayload | null> {
  if (!supabase || !supabaseConfigured) return null;
  const normalised = normaliseShareCode(code);
  if (!normalised) return null;

  const { data, error } = await supabase.rpc('get_shared_menu', {
    p_share_code: normalised,
  });

  if (error) {
    console.error('[sharedMenu] RPC error', { code: normalised, error });
    return null;
  }
  if (!data) return null;

  const raw = data as Omit<SharedMenuPayload, 'recipes'> & {
    recipes: RawSharedMenuRecipe[];
  };

  return {
    ...raw,
    recipes: (raw.recipes ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      image_url: resolveRecipeImageUrl(r),
      cuisine: r.cuisine,
      servings: r.servings,
      total_minutes: r.total_minutes,
      slug: r.slug ?? null,
      source: r.source,
    })),
  };
}
