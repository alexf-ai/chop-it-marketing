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
import { getRecipeSegments } from './segments';

export const SITE_ORIGIN = 'https://chop-it.com';

// Map curated catalog segments → Google-recognised recipeCategory values.
// Schema.org accepts free strings but Google's Rich Results parser
// special-cases a known list ("Dessert", "Main Course", "Appetizer",
// "Side Dish", "Barbecue", "Breakfast", …). Anything off that list
// degrades to a plain string and loses the category facet in SERPs.
//
// The mapping collapses our 11 segments into 2 valid buckets — most
// segments are dinner-shaped (Main Course); "puds" maps to Dessert and
// "bbq_szn" maps to Barbecue. The default below (Main Course) catches
// the (defensive) case of a recipe with no segments.
const SEGMENT_TO_CATEGORY: Record<string, string> = {
  puds: 'Dessert',
  bbq_szn: 'Barbecue',
  batch: 'Main Course',
  quick: 'Main Course',
  comfort: 'Main Course',
  tray_bake: 'Main Course',
  healthy: 'Main Course',
  fodmap: 'Main Course',
  high_protein: 'Main Course',
  one_pot: 'Main Course',
  kid_friendly: 'Main Course',
};

const DEFAULT_RECIPE_CATEGORY = 'Main Course';

function recipeCategoryFor(recipe: Recipe): string {
  const segments = getRecipeSegments(recipe.tags_json);
  const first = segments[0];
  return (first && SEGMENT_TO_CATEGORY[first]) ?? DEFAULT_RECIPE_CATEGORY;
}

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
    // TODO(SEO/H3): Google Rich Results prefers 1:1, 4:3, AND 16:9 aspect
    // variants for full Recipe eligibility. Cloudflare Images supports
    // named variants but `1x1`/`4x3`/`16x9` aren't provisioned on the
    // account yet (probed 2026-05-15: all return 403). When the variants
    // are created in the CF dashboard, swap this to:
    //   [`${base}/1x1`, `${base}/4x3`, `${base}/16x9`]
    // where `base` is the imagedelivery.net URL minus the trailing `/full`.
    image: recipe.image_url ? [recipe.image_url] : undefined,
    url,
    // published_at is NOT NULL on every row in recipes_published — Google
    // prefers both datePublished + dateModified for freshness signals.
    datePublished: new Date(recipe.published_at).toISOString(),
    dateModified: recipe.updated_at,
    author: { '@type': 'Organization', name: 'Chop it', url: SITE_ORIGIN },
    recipeYield: recipe.servings != null ? `${recipe.servings} servings` : undefined,
    // recipeCategory used to read recipe.season (only "summer" was ever
    // published so it was almost always "summer", which isn't a Google-
    // recognised category). Now derives from the curated catalog
    // segment instead — see SEGMENT_TO_CATEGORY above.
    recipeCategory: recipeCategoryFor(recipe),
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

// schema.org/BreadcrumbList JSON-LD. Built from the same Crumb shape the
// visible <Breadcrumbs> uses so the two never drift.
//
// Position is 1-indexed per spec; the final ListItem's `item` is omitted
// (it's the current page) — Google accepts both forms; omitting matches
// the schema.org Rich Results guidance.

export type BreadcrumbCrumbInput = { name: string; href?: string };

type BreadcrumbItem = {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
};

type BreadcrumbLd = {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
};

export function buildBreadcrumbJsonLd(crumbs: BreadcrumbCrumbInput[]): BreadcrumbLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i): BreadcrumbItem => {
      const item: BreadcrumbItem = {
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
      };
      // Final crumb (current page): omit `item` per Google guidance.
      if (c.href && i < crumbs.length - 1) {
        item.item = c.href.startsWith('http') ? c.href : `${SITE_ORIGIN}${c.href}`;
      }
      return item;
    }),
  };
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
