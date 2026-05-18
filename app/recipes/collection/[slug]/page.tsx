// Editorial collection landing pages (v1). 11 SEO-indexable URLs at
// /recipes/collection/<slug>, each rendering a hand-picked taxonomy
// segment (tags_json._catalog.segments[…]) as a curated grid with intro
// copy. Placeholder copy lives in app/lib/collections.ts — Vita rewrites
// later. Coexists with /recipes/tag/[tag] and /recipes/cuisine/[cuisine];
// both stay indexable. Collections are an addition, not a replacement.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import { COLLECTION_META, COLLECTION_SLUGS } from '@/app/lib/collections';
import { listCollectionRecipes } from '@/app/lib/recipes';
import { serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 3600;

const ACCENT = '#E8547A';

export async function generateStaticParams() {
  return COLLECTION_SLUGS.map((slug) => ({ slug }));
}

function collectionUrl(slug: string): string {
  return `${SITE_ORIGIN}/recipes/collection/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = COLLECTION_META[slug];
  if (!meta) return { title: 'Collection not found · Chop it' };
  const url = collectionUrl(slug);
  const title = `${meta.name} recipes | Chop it`;
  const description = meta.intro.slice(0, 150);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    robots: { index: true, follow: true },
  };
}

// Single CollectionPage JSON-LD with a nested ItemList as mainEntity, so
// Google's GSC URL inspector picks the ItemList up as the page-level
// listing wrapper. ListItems are flat (position + url + name) — they're
// pointers to the recipe detail pages, which carry their own Recipe
// schema. Previously this emitted two separate top-level blocks, which
// GSC failed to associate as a listing.
function buildCollectionJsonLd(
  slug: string,
  meta: { name: string; intro: string },
  items: { slug: string; title: string }[],
): Record<string, unknown> {
  const url = collectionUrl(slug);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${meta.name} recipes`,
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

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = COLLECTION_META[slug];
  if (!meta) notFound();

  const items = await listCollectionRecipes(slug, { limit: 60 });
  const jsonLd = buildCollectionJsonLd(slug, meta, items);

  return (
    <>
      <Nav accent={ACCENT} />
      <section className="section recipes-hub">
        <div className="section-head">
          <div className="kicker mono">— COLLECTION</div>
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
