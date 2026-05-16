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

export type SharedMenuRecipe = {
  id: string;
  title: string | null;
  image_url: string | null;
  cuisine: string | null;
  servings: number | null;
  total_minutes: number | null;
  source: 'user' | 'published' | 'public' | 'unknown';
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
  return data as SharedMenuPayload;
}
