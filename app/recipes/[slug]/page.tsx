import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import BackLink from '@/app/components/BackLink';
import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeCTA from '@/app/components/RecipeCTA';
import RecipeGrid from '@/app/components/RecipeGrid';
import RecipeViewTracker from '@/app/components/RecipeViewTracker';
import {
  getPublishedRecipeBySlug,
  getPublishedRecipeSlugs,
  getSlugById,
  listCollectionRecipes,
  listPublishedRecipes,
  type RecipeListItem,
} from '@/app/lib/recipes';
import {
  buildBreadcrumbJsonLd,
  buildRecipeJsonLd,
  serializeJsonLd,
  SITE_ORIGIN,
} from '@/app/lib/recipeSchema';
import { pickPrimarySegment, segmentTitle } from '@/app/lib/segments';

export const revalidate = 3600;

// Legacy /recipes/<uuid> URLs (the old id-based route) fall through to this
// segment; if the value looks like a UUID we resolve it to a slug and 301.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveSlugOrRedirect(maybe: string): Promise<string> {
  if (UUID_RE.test(maybe)) {
    const realSlug = await getSlugById(maybe);
    if (!realSlug) notFound();
    permanentRedirect(`/recipes/${realSlug}`);
  }
  return maybe;
}

export async function generateStaticParams() {
  const slugs = await getPublishedRecipeSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  // Skip metadata work for UUID redirects — the redirect happens before any
  // metadata is rendered to the client.
  if (UUID_RE.test(raw)) return { title: 'Chop it' };
  const slug = raw;
  const recipe = await getPublishedRecipeBySlug(slug);
  if (!recipe) return { title: 'Recipe not found · Chop it' };

  const description =
    recipe.hero_description ??
    `Ingredients and step-by-step method for ${recipe.title}.`;
  const url = `${SITE_ORIGIN}/recipes/${recipe.slug}`;
  const images = recipe.image_url ? [recipe.image_url] : [];

  return {
    title: `${recipe.title} · Chop it`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: recipe.title,
      description,
      url,
      type: 'article',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description,
      images,
    },
  };
}

const ACCENT = '#E8547A';

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = await resolveSlugOrRedirect(raw);
  const recipe = await getPublishedRecipeBySlug(slug);
  if (!recipe) notFound();

  const ingredients = recipe.ingredients_json ?? [];
  const steps = recipe.method_steps_json ?? [];
  const t = recipe.timings_json;
  const hasNutrition =
    recipe.nutrition_source != null &&
    (recipe.nutrition_kcal != null ||
      recipe.nutrition_protein_g != null ||
      recipe.nutrition_fibre_g != null ||
      recipe.nutrition_carbs_g != null ||
      recipe.nutrition_fat_g != null);

  // SEO breadcrumb trail. The visible crumbs + BreadcrumbList JSON-LD share
  // this same data so they never drift. Position 3 (collection) is
  // conditional — recipes with no catalog segment collapse to
  // Home › Recipes › <title>. Cuisine is tracked separately for analytics
  // (RecipeViewTracker) but no longer surfaced in the breadcrumb — the
  // collection segment is a stronger editorial unit and lines up with the
  // "More from <segment>" section at the foot of the page.
  const cuisine = recipe.tags_json?.core?.[0] ?? null;
  const primarySegment = pickPrimarySegment(recipe.tags_json);
  const primarySegmentName = primarySegment ? segmentTitle(primarySegment) : null;
  const crumbs: Crumb[] = [
    { name: 'Home', href: '/' },
    { name: 'Recipes', href: '/recipes' },
  ];
  if (primarySegment && primarySegmentName) {
    crumbs.push({
      name: primarySegmentName,
      href: `/recipes/collection/${primarySegment}`,
    });
  }
  crumbs.push({ name: recipe.title });

  // "More from <segment>" — fetch 5 then drop the current slug so we always
  // land on 4 cards. If the recipe has no catalog segment, fall back to the
  // top of the published library (display-priority-ordered, server-rendered
  // so the bot sees the internal links).
  let relatedRecipes: RecipeListItem[] = [];
  let relatedHeading = 'More recipes';
  if (primarySegment) {
    const fetched = await listCollectionRecipes(primarySegment, { limit: 5 });
    relatedRecipes = fetched.filter((r) => r.slug !== recipe.slug).slice(0, 4);
    relatedHeading = `More from ${primarySegmentName}`;
  } else {
    const { items } = await listPublishedRecipes({ perPage: 5 });
    relatedRecipes = items.filter((r) => r.slug !== recipe.slug).slice(0, 4);
  }

  // H2 alt-text format: "{title} — {cuisine}, {season}" where available.
  // Falls back to bare title when neither is present.
  const altSuffix = [cuisine, recipe.season].filter((s): s is string => Boolean(s)).join(', ');
  const heroAlt = altSuffix ? `${recipe.title} — ${altSuffix}` : recipe.title;

  const recipeLd = buildRecipeJsonLd(recipe);
  const breadcrumbLd = buildBreadcrumbJsonLd(crumbs);

  return (
    <>
      <Nav accent={ACCENT} />
      <RecipeViewTracker
        recipe_id={recipe.id}
        recipe_slug={recipe.slug}
        recipe_title={recipe.title}
        cuisine={cuisine}
        season={recipe.season}
        cost_band={recipe.cost_band}
        has_nutrition={hasNutrition}
      />
      <article className="recipe-page">
        <BackLink href="/recipes" className="recipe-back-link">
          ← Back
        </BackLink>
        <Breadcrumbs crumbs={crumbs} />

        {recipe.image_url && (
          <div className="recipe-page-hero">
            <Image
              src={recipe.image_url}
              alt={heroAlt}
              width={1200}
              height={1500}
              priority
              fetchPriority="high"
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>
        )}

        <header className="recipe-page-header">
          <h1 className="recipe-page-title">{recipe.title}</h1>
          {recipe.hero_description && (
            <p className="hero-description">{recipe.hero_description}</p>
          )}
          {(t?.prep_minutes != null ||
            t?.cook_minutes != null ||
            t?.total_minutes != null ||
            recipe.servings != null) && (
            <ul className="recipe-meta-strip mono">
              {t?.prep_minutes != null && (
                <li>
                  <span className="meta-k">Prep</span>
                  <span className="meta-v">{t.prep_minutes} min</span>
                </li>
              )}
              {t?.cook_minutes != null && (
                <li>
                  <span className="meta-k">Cook</span>
                  <span className="meta-v">{t.cook_minutes} min</span>
                </li>
              )}
              {t?.total_minutes != null && (
                <li>
                  <span className="meta-k">Total</span>
                  <span className="meta-v">{t.total_minutes} min</span>
                </li>
              )}
              {recipe.servings != null && (
                <li>
                  <span className="meta-k">Serves</span>
                  <span className="meta-v">{recipe.servings}</span>
                </li>
              )}
            </ul>
          )}
          {recipe.tags_json?.core && recipe.tags_json.core.length > 0 && (
            <div className="recipe-tags">
              {/* Tags are visual classification chips, not navigation. The
                  old /recipes/tag/<tag> taxonomy was retired (now 410 Gone in
                  middleware.ts), so these are plain spans — browse-by-tag is
                  served by search instead. */}
              {recipe.tags_json.core.map((tag) => (
                <span key={tag} className="tag mono">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {ingredients.length > 0 && (
          <section className="recipe-section">
            <h2 className="recipe-h">Ingredients</h2>
            <ul className="recipe-ingredients">
              {ingredients.map((ing, i) => (
                <li key={i} className={ing.optional ? 'optional' : ''}>
                  {ing.display}
                </li>
              ))}
            </ul>
          </section>
        )}

        {steps.length > 0 && (
          <section className="recipe-section">
            <h2 className="recipe-h">Method</h2>
            <ol className="recipe-method">
              {steps.map((s, i) => (
                <li key={i}>{s.text}</li>
              ))}
            </ol>
          </section>
        )}

        {hasNutrition && (
          <section className="nutrition">
            <h2 className="nutrition-h">Per serving</h2>
            <div className="nutrition-grid">
              {recipe.nutrition_kcal != null && (
                <div className="nutrition-cell">
                  <span className="meta-v">{recipe.nutrition_kcal}</span>
                  <span className="meta-k">kcal</span>
                </div>
              )}
              {recipe.nutrition_protein_g != null && (
                <div className="nutrition-cell">
                  <span className="meta-v">{recipe.nutrition_protein_g}g</span>
                  <span className="meta-k">protein</span>
                </div>
              )}
              {recipe.nutrition_fibre_g != null && (
                <div className="nutrition-cell">
                  <span className="meta-v">{recipe.nutrition_fibre_g}g</span>
                  <span className="meta-k">fibre</span>
                </div>
              )}
              {recipe.nutrition_carbs_g != null && (
                <div className="nutrition-cell">
                  <span className="meta-v">{recipe.nutrition_carbs_g}g</span>
                  <span className="meta-k">carbs</span>
                </div>
              )}
              {recipe.nutrition_fat_g != null && (
                <div className="nutrition-cell">
                  <span className="meta-v">{recipe.nutrition_fat_g}g</span>
                  <span className="meta-k">fat</span>
                </div>
              )}
            </div>
          </section>
        )}

        {relatedRecipes.length > 0 && (
          <section className="recipe-related">
            <div className="recipe-related-head">
              <h2 className="recipe-related-h">{relatedHeading}</h2>
              {primarySegment && (
                <Link
                  href={`/recipes/collection/${primarySegment}`}
                  className="recipe-related-more mono"
                >
                  See all →
                </Link>
              )}
            </div>
            <RecipeGrid items={relatedRecipes} />
          </section>
        )}

        <RecipeCTA recipeSlug={recipe.slug} recipeTitle={recipe.title} />
      </article>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(recipeLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />

      <Footer />
    </>
  );
}
