// Server-side data fetch for /m/<code> single-recipe share pages.
//
// `shared_links` stores one row per individually-shared recipe. The whole
// recipe is denormalised into a JSONB `snapshot` so the share survives
// edits or deletions of the source recipe. The id column is the share
// code itself (8-char A-Z0-9 from the app's encoder).
//
// RLS is disabled on `shared_links` and the anon role has SELECT, so the
// marketing site reads the table directly with the anon key — no RPC.
//
// Returns `null` when the code doesn't exist, has expired, OR Supabase
// isn't configured. The route turns null into a 404 (which lets a menu
// lookup try first and fall through here for individual recipe codes).
//
// Snapshot shape: the app writes a denormalised superset of every field
// it might want to render. Field names are inconsistent (snake_case and
// camelCase coexist) because the snapshot is a union of payloads from
// multiple recipe sources (user_recipes, recipes_published, public
// catalog). We tolerate both casings on read.

import { resolveRecipeImageUrl } from './cloudflareImage';
import { supabase, supabaseConfigured } from './supabase';

export type SharedRecipeIngredient = {
  display: string;
  optional: boolean;
};

export type SharedRecipePayload = {
  share_code: string;
  title: string;
  description: string | null;
  image_url: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  total_minutes: number | null;
  cuisine: string | null;
  tags: string[];
  ingredients: SharedRecipeIngredient[];
  steps: string[];
  created_at: string;
};

type SharedLinkRow = {
  id: string;
  recipe_type: string | null;
  recipe_ref: string | null;
  snapshot: Record<string, unknown> | null;
  created_at: string;
  expires_at: string | null;
};

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function firstString(snapshot: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = asString(snapshot[k]);
    if (v) return v;
  }
  return null;
}

function firstNumber(snapshot: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = asNumber(snapshot[k]);
    if (v != null) return v;
  }
  return null;
}

function normaliseIngredients(value: unknown): SharedRecipeIngredient[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw): SharedRecipeIngredient | null => {
      if (typeof raw === 'string') {
        const display = raw.trim();
        return display ? { display, optional: false } : null;
      }
      if (raw && typeof raw === 'object') {
        const r = raw as Record<string, unknown>;
        const display = firstString(r, ['display', 'rawText', 'text', 'name']);
        if (!display) return null;
        return { display, optional: r.optional === true };
      }
      return null;
    })
    .filter((i): i is SharedRecipeIngredient => i !== null);
}

function normaliseSteps(snapshot: Record<string, unknown>): string[] {
  // Prefer the structured `steps` array; fall back to splitting `instructions`
  // on newlines if that's all we have.
  const raw = snapshot.steps;
  if (Array.isArray(raw)) {
    const cleaned = raw
      .map((s) => {
        if (typeof s === 'string') return s.trim();
        if (s && typeof s === 'object') {
          return asString((s as Record<string, unknown>).text);
        }
        return null;
      })
      .filter((s): s is string => Boolean(s));
    if (cleaned.length > 0) return cleaned;
  }
  const fallback = asString(snapshot.instructions);
  if (!fallback) return [];
  return fallback
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function normaliseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((t) => (typeof t === 'string' ? t.trim() : null))
    .filter((t): t is string => Boolean(t));
}

export async function getSharedRecipe(code: string): Promise<SharedRecipePayload | null> {
  if (!supabase || !supabaseConfigured) return null;

  const { data, error } = await supabase
    .from('shared_links')
    .select('id, recipe_type, recipe_ref, snapshot, created_at, expires_at')
    .eq('id', code)
    .maybeSingle<SharedLinkRow>();

  if (error) {
    console.error('[sharedRecipe] query error', { code, error });
    return null;
  }
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;

  const snapshot = data.snapshot ?? {};
  const title = firstString(snapshot, ['title', 'displayTitle', 'canonicalTitle', 'name']);
  if (!title) return null;

  return {
    share_code: data.id,
    title,
    description: firstString(snapshot, ['description']),
    // The snapshot's image_url/imageUrl is frequently absent; fall back to a
    // URL built from the Cloudflare id (snake_case or camelCase) or image_key.
    image_url: resolveRecipeImageUrl({
      image_url: firstString(snapshot, ['image_url', 'imageUrl']),
      cloudflare_image_id: firstString(snapshot, ['cloudflareImageId', 'cloudflare_image_id']),
      image_key: firstString(snapshot, ['image_key', 'imageKey']),
    }),
    servings: firstNumber(snapshot, ['servings']),
    prep_minutes: firstNumber(snapshot, ['prepMinutes', 'prep_minutes', 'prepTime']),
    cook_minutes: firstNumber(snapshot, ['cookMinutes', 'cook_minutes', 'cookTime']),
    total_minutes: firstNumber(snapshot, [
      'totalMinutes',
      'total_minutes',
      'durationMinutes',
      'timeMinutes',
      'totalTime',
    ]),
    cuisine: firstString(snapshot, ['cuisine', 'dishStyle']),
    tags: normaliseTags(snapshot.tags),
    ingredients: normaliseIngredients(snapshot.ingredients),
    steps: normaliseSteps(snapshot),
    created_at: data.created_at,
  };
}
