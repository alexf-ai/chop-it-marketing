import { supabase, supabaseConfigured } from './supabase';

export type Ingredient = {
  display: string;
  optional?: boolean;
};

export type MethodStep = { text: string };

export type Timings = {
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  total_minutes?: number | null;
};

export type Recipe = {
  id: string;
  title: string;
  image_url: string | null;
  season: string | null;
  display_priority: number | null;
  servings: number | null;
  ingredients_json: Ingredient[] | null;
  method_steps_json: MethodStep[] | null;
  timings_json: Timings | null;
  nutrition_kcal: number | null;
  nutrition_protein_g: number | null;
  nutrition_fibre_g: number | null;
  nutrition_carbs_g: number | null;
  nutrition_fat_g: number | null;
};

const RECIPE_COLUMNS =
  'id, title, image_url, season, display_priority, servings, ingredients_json, method_steps_json, timings_json, nutrition_kcal, nutrition_protein_g, nutrition_fibre_g, nutrition_carbs_g, nutrition_fat_g';

export async function getAllRecipeIds(): Promise<string[]> {
  if (!supabase || !supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('recipes_published')
    .select('id')
    .is('deleted_at', null)
    .not('image_url', 'is', null);
  if (error || !data) return [];
  return data.map((r) => r.id as string);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!supabase || !supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('recipes_published')
    .select(RECIPE_COLUMNS)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error || !data) return null;
  return data as Recipe;
}
