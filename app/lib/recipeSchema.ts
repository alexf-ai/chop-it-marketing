// schema.org/Recipe JSON-LD builder for chop-it.com SEO recipe pages.
//
// Maps a Recipe row from public.recipes_published onto the Google Rich
// Results "Recipe" type. Optional fields are omitted (not emitted as null)
// so the payload stays compact and validates cleanly in the Google Rich
// Results Test.
//
// Fields we DON'T emit:
// - aggregateRating / review — we have no rating UGC yet on chop-it.com.
// - video — no recipe videos shipped yet.
// - recipeCuisine derives from tags_json.core[0] (positional convention).
// - keywords derives from tags_json.core joined with commas.

import { isoDuration, stripUndefined } from './iso';
import type { Recipe } from './recipes';

export const SITE_ORIGIN = 'https://chop-it.com';

type NutritionInformation = {
  '@type': 'NutritionInformation';
  calories?: string;
  proteinContent?: string;
  fiberContent?: string;
  carbohydrateContent?: string;
  fatContent?: string;
  servingSize?: string;
};

type HowToStep = {
  '@type': 'HowToStep';
  position: number;
  text: string;
};

type RecipeLd = {
  '@context': 'https://schema.org';
  '@type': 'Recipe';
  '@id'?: string;
  name: string;
  description?: string;
  image?: string[];
  url?: string;
  datePublished?: string;
  dateModified?: string;
  author?: { '@type': 'Organization'; name: string; url: string };
  recipeYield?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  keywords?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeIngredient?: string[];
  recipeInstructions?: HowToStep[];
  nutrition?: NutritionInformation;
};

function buildNutrition(recipe: Recipe): NutritionInformation | undefined {
  // Spec acceptance: "Recipe page renders correctly when nutrition_source is
  // NULL (nutrition section hidden, no errors)". Apply the same to JSON-LD
  // — better to omit nutrition entirely than emit partials.
  if (!recipe.nutrition_source) return undefined;
  const hasAny =
    recipe.nutrition_kcal != null ||
    recipe.nutrition_protein_g != null ||
    recipe.nutrition_fibre_g != null ||
    recipe.nutrition_carbs_g != null ||
    recipe.nutrition_fat_g != null;
  if (!hasAny) return undefined;
  return stripUndefined({
    '@type': 'NutritionInformation' as const,
    calories: recipe.nutrition_kcal != null ? `${recipe.nutrition_kcal} kcal` : undefined,
    proteinContent:
      recipe.nutrition_protein_g != null ? `${recipe.nutrition_protein_g} g` : undefined,
    fiberContent:
      recipe.nutrition_fibre_g != null ? `${recipe.nutrition_fibre_g} g` : undefined,
    carbohydrateContent:
      recipe.nutrition_carbs_g != null ? `${recipe.nutrition_carbs_g} g` : undefined,
    fatContent: recipe.nutrition_fat_g != null ? `${recipe.nutrition_fat_g} g` : undefined,
    servingSize: recipe.servings != null ? `1 serving (of ${recipe.servings})` : undefined,
  }) as NutritionInformation;
}

export function buildRecipeJsonLd(recipe: Recipe): RecipeLd {
  const url = `${SITE_ORIGIN}/recipes/${recipe.slug}`;
  const core = recipe.tags_json?.core ?? [];
  const cuisine = core.length > 0 ? core[0] : undefined;
  const keywords = core.length > 0 ? core.join(', ') : undefined;

  const ingredients = (recipe.ingredients_json ?? [])
    .map((i) => i.display)
    .filter((s): s is string => typeof s === 'string' && s.length > 0);

  const instructions: HowToStep[] = (recipe.method_steps_json ?? [])
    .map((s, i) => ({ '@type': 'HowToStep' as const, position: i + 1, text: s.text }))
    .filter((s) => typeof s.text === 'string' && s.text.length > 0);

  const t = recipe.timings_json;

  const ld: RecipeLd = stripUndefined({
    '@context': 'https://schema.org' as const,
    '@type': 'Recipe' as const,
    '@id': url,
    name: recipe.title,
    description: recipe.hero_description ?? undefined,
    image: recipe.image_url ? [recipe.image_url] : undefined,
    url,
    dateModified: recipe.updated_at,
    author: { '@type': 'Organization', name: 'Chop it', url: SITE_ORIGIN },
    recipeYield: recipe.servings != null ? `${recipe.servings} servings` : undefined,
    recipeCategory: recipe.season ?? undefined,
    recipeCuisine: cuisine,
    keywords,
    prepTime: isoDuration(t?.prep_minutes),
    cookTime: isoDuration(t?.cook_minutes),
    totalTime: isoDuration(t?.total_minutes),
    recipeIngredient: ingredients.length > 0 ? ingredients : undefined,
    recipeInstructions: instructions.length > 0 ? instructions : undefined,
    nutrition: buildNutrition(recipe),
  }) as RecipeLd;
  return ld;
}

export function serializeJsonLd(ld: object): string {
  // Two safety transforms:
  //   1. Escape `</` so a stray `</script>` in user-supplied copy can't break
  //      out of the <script> tag.
  //   2. Escape unicode line separator characters that break parser in some
  //      old browsers.
  return JSON.stringify(ld)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
