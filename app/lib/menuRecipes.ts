// Full-content fetch for a shared menu — ingredients, grouped ingredients,
// method and tags, not just the tile fields get_shared_menu returns.
//
// Backs the interactive "This week's dinners" blog post: each recipe is
// rendered in full (for SEO) and explorable in the UI. Calls the
// public.get_menu_recipes_full SECURITY DEFINER RPC so the anon key is
// enough (user_recipes is RLS-protected).
//
// The RPC passes field shapes through largely as stored; the three recipe
// sources disagree on casing/structure (strings vs {display}/{text}
// objects), so all the tolerant normalisation lives here.

import { resolveRecipeImageUrl } from './cloudflareImage';
import { supabasePublic, supabasePublicConfigured } from '@/lib/supabase-public';

export type IngredientGroup = {
  title: string | null;
  items: string[];
};

export type FullMenuRecipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cuisine: string | null;
  servings: number | null;
  total_minutes: number | null;
  tags: string[];
  ingredients: string[];
  ingredientGroups: IngredientGroup[];
  method: string[];
  source: 'user' | 'published' | 'public' | 'unknown';
};

export type FullMenu = {
  share_code: string;
  collection: { id: string; name: string; kind: string; created_at: string };
  recipes: FullMenuRecipe[];
};

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Ingredient / step entries arrive as plain strings (user recipes) or objects
// keyed inconsistently (published/public recipes). Pull the human-readable
// text out of either.
function pickText(value: unknown, keys: string[]): string | null {
  if (typeof value === 'string') return asString(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const k of keys) {
      const v = asString(obj[k]);
      if (v) return v;
    }
  }
  return null;
}

function normaliseStringList(value: unknown, keys: string[]): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => pickText(v, keys))
    .filter((s): s is string => s !== null);
}

const INGREDIENT_KEYS = ['display', 'rawText', 'text', 'name'];
const STEP_KEYS = ['text', 'step', 'instruction'];

function normaliseGroups(value: unknown): IngredientGroup[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw): IngredientGroup | null => {
      if (!raw || typeof raw !== 'object') return null;
      const obj = raw as Record<string, unknown>;
      const items = normaliseStringList(obj.items ?? obj.ingredients, INGREDIENT_KEYS);
      if (items.length === 0) return null;
      return { title: asString(obj.title) ?? asString(obj.name), items };
    })
    .filter((g): g is IngredientGroup => g !== null);
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

type RawRecipe = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  cloudflare_image_id: string | null;
  image_key: string | null;
  cuisine: string | null;
  servings: number | null;
  total_minutes: number | null;
  tags: unknown;
  ingredients: unknown;
  ingredient_groups: unknown;
  method: unknown;
  source: FullMenuRecipe['source'];
};

type RawMenu = {
  share_code: string;
  collection: FullMenu['collection'];
  recipes: RawRecipe[];
};

export async function getMenuRecipesFull(code: string): Promise<FullMenu | null> {
  if (!supabasePublic || !supabasePublicConfigured) return null;

  const { data, error } = await supabasePublic.rpc('get_menu_recipes_full', {
    p_share_code: code,
  });
  if (error) {
    console.error('[menuRecipes] RPC error', { code, error });
    return null;
  }
  if (!data) return null;

  const raw = data as RawMenu;
  const recipes: FullMenuRecipe[] = (raw.recipes ?? [])
    .map((r): FullMenuRecipe | null => {
      const title = asString(r.title);
      if (!title) return null;
      const ingredientGroups = normaliseGroups(r.ingredient_groups);
      // Flat ingredient list, falling back to flattening the groups so a
      // recipe that only stored grouped ingredients still has a flat list
      // for the JSON-LD recipeIngredient array.
      let ingredients = normaliseStringList(r.ingredients, INGREDIENT_KEYS);
      if (ingredients.length === 0 && ingredientGroups.length > 0) {
        ingredients = ingredientGroups.flatMap((g) => g.items);
      }
      return {
        id: r.id,
        title,
        description: asString(r.description),
        image_url: resolveRecipeImageUrl(r),
        cuisine: asString(r.cuisine),
        servings: asNumber(r.servings),
        total_minutes: asNumber(r.total_minutes),
        tags: normaliseStringList(r.tags, ['name', 'label']),
        ingredients,
        ingredientGroups,
        method: normaliseStringList(r.method, STEP_KEYS),
        source: r.source,
      };
    })
    .filter((r): r is FullMenuRecipe => r !== null);

  return { share_code: raw.share_code, collection: raw.collection, recipes };
}
