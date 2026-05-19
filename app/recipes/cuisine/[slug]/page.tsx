// Cuisine collection landing pages (/recipes/cuisine/<slug>). 17 curated
// SEO-indexable URLs mirroring the editorial /recipes/collection/<slug>
// segment pages — same hero, same grid, same JSON-LD shape. Recipes
// come from the search_public_recipes RPC (p_cuisines arg) so the
// canonical cuisine→recipes mapping lives server-side.
//
// Coexists with /recipes/tag/[tag] and /recipes/season/[season] — those
// are full-taxonomy listings; the cuisine routes are a curated
// 17-bucket subset with editorial intro copy.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import { CUISINE_META, CUISINE_SLUGS } from '@/app/lib/cuisines';
import { listCuisineRecipes } from '@/app/lib/recipes';
import { serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 3600;

const ACCENT = '#E8547A';
const PER_PAGE = 50;

export async function generateStaticParams() {
  return CUISINE_SLUGS.map((slug) => ({ slug }));
}

function cuisineUrl(slug: string): string {
  return `${SITE_ORIGIN}/recipes/cuisine/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = CUISINE_META[slug];
  if (!meta) return { title: 'Cuisine not found · Chop it' };
  const url = cuisineUrl(slug);
  const title = `${meta.name} Recipes | Chop It`;
  const description = meta.intro;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    robots: { index: true, follow: true },
  };
}

// Single CollectionPage JSON-LD with a nested ItemList (same shape as
// /recipes/collection/[slug]). ListItems are flat (position + url +
// name) because the per-recipe Recipe schema is emitted by the recipe
// detail pages — keeping these as pointers avoids the duplicate-Recipe
// detection GSC sometimes flags.
function buildCuisineJsonLd(
  slug: string,
  meta: { name: string; intro: string },
  items: { slug: string; title: string }[],
): Record<string, unknown> {
  const url = cuisineUrl(slug);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${meta.name} Recipes`,
    description: meta.intro,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((r, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_ORIGIN}/recipes/${r.slug}`,
        name: r.title,
      })),
    },
  };
}

export default async function CuisineCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = CUISINE_META[slug];
  if (!meta) notFound();

  const items = await listCuisineRecipes(slug, { limit: PER_PAGE });
  const jsonLd = buildCuisineJsonLd(slug, meta, items);

  return (
    <>
      <Nav accent={ACCENT} />
      <section className="section recipes-hub">
        <div className="section-head">
          <div className="kicker mono">— CUISINE</div>
          <h1 className="h-editorial">{meta.name}</h1>
          <p className="lead intro">{meta.intro}</p>
        </div>
        <RecipeGrid items={items} />
      </section>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Footer />
    </>
  );
}
