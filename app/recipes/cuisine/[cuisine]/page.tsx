import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import { getDistinctCuisines, listPublishedRecipes } from '@/app/lib/recipes';
import { SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 3600;

export async function generateStaticParams() {
  const cuisines = await getDistinctCuisines();
  return cuisines.map((cuisine) => ({ cuisine: encodeURIComponent(cuisine) }));
}

async function resolveCuisine(raw: string): Promise<string | null> {
  const decoded = decodeURIComponent(raw);
  const all = await getDistinctCuisines();
  return all.find((c) => c === decoded) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cuisine: string }>;
}): Promise<Metadata> {
  const { cuisine: raw } = await params;
  const cuisine = await resolveCuisine(raw);
  if (!cuisine) return { title: 'Cuisine not found · Chop it' };
  const url = `${SITE_ORIGIN}/recipes/cuisine/${encodeURIComponent(cuisine)}`;
  const title = `${cuisine} recipes · Chop it`;
  const description = `Browse every ${cuisine} recipe on Chop it. Sorted by season, scored by diversity.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
  };
}

const ACCENT = '#E8547A';

export default async function CuisineHubPage({
  params,
}: {
  params: Promise<{ cuisine: string }>;
}) {
  const { cuisine: raw } = await params;
  const cuisine = await resolveCuisine(raw);
  if (!cuisine) notFound();

  const { items } = await listPublishedRecipes({ cuisine, perPage: 48 });

  return (
    <>
      <Nav accent={ACCENT} />
      <section className="section recipes-hub">
        <div className="section-head">
          <div className="kicker mono">— CUISINE</div>
          <h1 className="h-editorial">{cuisine} recipes</h1>
          <p className="lead">
            Every {cuisine} recipe on Chop it. Sorted by display order, with
            seasonality in mind.
          </p>
        </div>
        <RecipeGrid items={items} />
      </section>
      <Footer />
    </>
  );
}
