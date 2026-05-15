import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeCTA from '@/app/components/RecipeCTA';
import {
  getPublishedRecipeBySlug,
  getPublishedRecipeSlugs,
  getSlugById,
} from '@/app/lib/recipes';
import { buildRecipeJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

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

  const ld = buildRecipeJsonLd(recipe);

  return (
    <>
      <Nav accent={ACCENT} />
      <article className="recipe-page">
        <Link href="/recipes" className="recipe-back mono">
          ← All recipes
        </Link>

        {recipe.image_url && (
          <div className="recipe-page-hero">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              width={1200}
              height={1500}
              priority
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
              {recipe.tags_json.core.map((tag) => (
                <Link
                  key={tag}
                  href={`/recipes/tag/${encodeURIComponent(tag)}`}
                  className="tag mono"
                >
                  {tag}
                </Link>
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

        <RecipeCTA />
      </article>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(ld) }}
      />

      <Footer />
    </>
  );
}
