import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import {
  countPublishedRecipes,
  getDistinctCostBands,
  getDistinctCuisines,
  getDistinctSeasons,
  listPublishedRecipes,
} from '@/app/lib/recipes';
import { SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 3600;

const PER_PAGE = 24;

type SearchParams = {
  page?: string;
  season?: string;
  cuisine?: string;
  cost?: string;
};

// H5 + faceted-nav SEO: anything beyond the canonical /recipes view should
// be noindex,follow — pagination (?page=2+) and any filter narrowing
// (?cuisine=…, ?season=…, ?cost=…). The canonical for those filtered views
// is the dedicated taxonomy page (/recipes/cuisine/<x>) when one exists.
function isCanonicalHubView(sp: SearchParams): boolean {
  const page = Number.parseInt(sp.page ?? '1', 10) || 1;
  if (page > 1) return false;
  if (sp.season || sp.cuisine || sp.cost) return false;
  return true;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const canonical = isCanonicalHubView(sp);
  const base: Metadata = {
    title: 'Recipes · Chop it',
    description:
      'Browse chef-approved recipes. Sorted by season, scored by diversity.',
    alternates: { canonical: `${SITE_ORIGIN}/recipes` },
    openGraph: {
      title: 'Recipes · Chop it',
      description:
        'Browse chef-approved recipes. Sorted by season, scored by diversity.',
      url: `${SITE_ORIGIN}/recipes`,
      type: 'website',
    },
  };
  if (!canonical) {
    base.robots = { index: false, follow: true };
  }
  return base;
}

const ACCENT = '#E8547A';

export default async function RecipesHubPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const season = sp.season || undefined;
  const cuisine = sp.cuisine || undefined;
  const costBand = sp.cost || undefined;

  const [total, { items }, seasons, cuisines, costBands] = await Promise.all([
    countPublishedRecipes(),
    listPublishedRecipes({ page, perPage: PER_PAGE, season, cuisine, costBand }),
    getDistinctSeasons(),
    getDistinctCuisines(),
    getDistinctCostBands(),
  ]);

  const filteredTotal = items.length; // count on the current page; total is unfiltered
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const buildHref = (overrides: Partial<SearchParams>) => {
    const qs = new URLSearchParams();
    const merged = { season, cuisine, cost: costBand, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    const q = qs.toString();
    return q ? `/recipes?${q}` : '/recipes';
  };

  return (
    <>
      <Nav accent={ACCENT} />
      <section className="section recipes-hub">
        <div className="section-head">
          <div className="kicker mono">— EVERY RECIPE</div>
          <h1 className="h-editorial">Recipes</h1>
          <p className="lead">
            Browse {total} chef-approved recipes. Sorted by season, scored by
            diversity.
          </p>
        </div>

        <nav className="recipe-filters mono" aria-label="Filter recipes">
          <div className="filter-group">
            <span className="filter-k">Season</span>
            <Link
              className={season ? 'filter-opt' : 'filter-opt on'}
              href={buildHref({ season: undefined, page: undefined })}
            >
              All
            </Link>
            {seasons.map((s) => (
              <Link
                key={s}
                className={season === s ? 'filter-opt on' : 'filter-opt'}
                href={buildHref({ season: s, page: undefined })}
              >
                {s}
              </Link>
            ))}
          </div>
          {cuisines.length > 0 && (
            <div className="filter-group">
              <span className="filter-k">Cuisine</span>
              <Link
                className={cuisine ? 'filter-opt' : 'filter-opt on'}
                href={buildHref({ cuisine: undefined, page: undefined })}
              >
                All
              </Link>
              {cuisines.map((c) => (
                <Link
                  key={c}
                  className={cuisine === c ? 'filter-opt on' : 'filter-opt'}
                  href={buildHref({ cuisine: c, page: undefined })}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
          {costBands.length > 0 && (
            <div className="filter-group">
              <span className="filter-k">Cost</span>
              <Link
                className={costBand ? 'filter-opt' : 'filter-opt on'}
                href={buildHref({ cost: undefined, page: undefined })}
              >
                All
              </Link>
              {costBands.map((c) => (
                <Link
                  key={c}
                  className={costBand === c ? 'filter-opt on' : 'filter-opt'}
                  href={buildHref({ cost: c, page: undefined })}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <RecipeGrid items={items} />

        {totalPages > 1 && (
          <nav className="recipe-pagination mono" aria-label="Pagination">
            {page > 1 && (
              <Link
                className="filter-opt"
                href={buildHref({ page: page > 2 ? String(page - 1) : undefined })}
              >
                ← Prev
              </Link>
            )}
            <span className="filter-k">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link className="filter-opt" href={buildHref({ page: String(page + 1) })}>
                Next →
              </Link>
            )}
          </nav>
        )}
        {filteredTotal === 0 && (season || cuisine || costBand) && (
          <p className="muted">
            No recipes match these filters yet.{' '}
            <Link href="/recipes" className="filter-opt">
              Reset
            </Link>
          </p>
        )}
      </section>
      <Footer />
    </>
  );
}
