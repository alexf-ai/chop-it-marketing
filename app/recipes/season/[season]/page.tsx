import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import { getDistinctSeasons, listPublishedRecipes } from '@/app/lib/recipes';
import { SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 3600;

export async function generateStaticParams() {
  const seasons = await getDistinctSeasons();
  return seasons.map((season) => ({ season }));
}

async function resolveSeason(raw: string): Promise<string | null> {
  const decoded = decodeURIComponent(raw);
  const all = await getDistinctSeasons();
  return all.find((s) => s === decoded) ?? null;
}

const capFirst = (s: string) => (s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ season: string }>;
}): Promise<Metadata> {
  const { season: raw } = await params;
  const season = await resolveSeason(raw);
  if (!season) return { title: 'Season not found · Chop it' };
  const url = `${SITE_ORIGIN}/recipes/season/${encodeURIComponent(season)}`;
  const Title = capFirst(season);
  return {
    title: `${Title} recipes · Chop it`,
    description: `Recipes in season for ${season}. Sorted by display order, scored by diversity.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${Title} recipes · Chop it`,
      description: `Recipes in season for ${season}.`,
      url,
      type: 'website',
    },
  };
}

const ACCENT = '#E8547A';

export default async function SeasonHubPage({
  params,
}: {
  params: Promise<{ season: string }>;
}) {
  const { season: raw } = await params;
  const season = await resolveSeason(raw);
  if (!season) notFound();

  const { items } = await listPublishedRecipes({ season, perPage: 48 });

  return (
    <>
      <Nav accent={ACCENT} />
      <section className="section recipes-hub">
        <div className="section-head">
          <div className="kicker mono">— SEASON</div>
          <h1 className="h-editorial">{capFirst(season)} recipes</h1>
          <p className="lead">
            Everything we&rsquo;re cooking this {season}. Picked for produce in
            its prime.
          </p>
        </div>
        <RecipeGrid items={items} />
      </section>
      <Footer />
    </>
  );
}
