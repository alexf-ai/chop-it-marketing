import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import { CUISINE_COUNTS, CUISINE_META, CUISINE_SLUGS } from '@/app/lib/cuisines';
import {
  countPublishedRecipes,
  getDistinctCostBands,
  getDistinctCuisines,
  listPublishedRecipes,
  searchPublicRecipes,
} from '@/app/lib/recipes';
import { serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 3600;

const PER_PAGE = 24;

type SearchParams = {
  q?: string;
  page?: string;
  season?: string;
  cuisine?: string;
  cost?: string;
};

// H5 + faceted-nav SEO: anything beyond the canonical /recipes view should
// be noindex,follow — pagination (?page=2+) and any filter narrowing
// (?cuisine=…, ?season=…, ?cost=…). The canonical for those filtered views
// is the dedicated taxonomy page (/recipes/cuisine/<x>) when one exists.
//
// Search (?q=…) is the exception: it gets its own metadata branch with
// index,follow (or noindex when zero results) so see generateMetadata
// below.
function isCanonicalHubView(sp: SearchParams): boolean {
  const page = Number.parseInt(sp.page ?? '1', 10) || 1;
  if (page > 1) return false;
  if (sp.season || sp.cuisine || sp.cost) return false;
  return true;
}

// Build a canonical search URL. Avoids URLSearchParams's `+` encoding for
// spaces — encodeURIComponent uses %20, which matches what the form
// submission produces and what we set as the alternates.canonical.
function searchUrl(query: string): string {
  return `${SITE_ORIGIN}/recipes?q=${encodeURIComponent(query)}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';

  if (q) {
    // We have to run the search once here just to get total_count for the
    // index/noindex decision and the description. Next caches the RPC at
    // the route ISR level so the duplicate call inside the page body is a
    // no-op.
    const { total } = await searchPublicRecipes(q, { perPage: PER_PAGE });
    const canonical = searchUrl(q);
    return {
      title: `"${q}" recipes | Chop it`,
      description: `${total} recipes matching "${q}" — cooking inspiration from Chop it.`,
      alternates: { canonical },
      openGraph: {
        title: `"${q}" recipes · Chop it`,
        description: `${total} recipes matching "${q}".`,
        url: canonical,
        type: 'website',
      },
      robots:
        total === 0
          ? { index: false, follow: true }
          : { index: true, follow: true },
    };
  }

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

// SearchResultsPage with a nested ItemList. Google's GSC URL inspector
// fails to detect a top-level ItemList on a search page — it expects the
// SearchResultsPage wrapper that explicitly types the page intent. Flat
// ListItems (url + name only, no nested Recipe item) so the schema is
// unambiguous as a "listing pointer" rather than competing with the
// per-recipe Recipe schema rendered on each detail page.
function buildSearchResultsPageJsonLd(
  query: string,
  items: { slug: string; title: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Recipes matching "${query}"`,
    url: searchUrl(query),
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

export default async function RecipesHubPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const q = sp.q?.trim() ?? '';

  // Two modes:
  //   - Search mode (q present): call the RPC, ignore facet filters
  //     (combining search + facets is v1.1). The filter bar still renders
  //     because the hub layout stays the same; the filter links drop q so
  //     clicking one exits search mode.
  //   - Browse mode (no q): existing listPublishedRecipes path.
  const searchMode = q.length > 0;
  const season = searchMode ? undefined : sp.season || undefined;
  const cuisine = searchMode ? undefined : sp.cuisine || undefined;
  const costBand = searchMode ? undefined : sp.cost || undefined;

  const [total, listResult, cuisines, costBands] = await Promise.all([
    countPublishedRecipes(),
    searchMode
      ? searchPublicRecipes(q, { page, perPage: PER_PAGE })
      : listPublishedRecipes({ page, perPage: PER_PAGE, season, cuisine, costBand }),
    getDistinctCuisines(),
    getDistinctCostBands(),
  ]);
  const { items, total: resultTotal } = listResult;

  const totalPages = Math.max(
    1,
    Math.ceil((searchMode ? resultTotal : total) / PER_PAGE),
  );
  const filteredTotal = items.length;

  const buildHref = (overrides: Partial<SearchParams>) => {
    const qs = new URLSearchParams();
    const merged: Partial<SearchParams> = searchMode
      ? { q, page: page > 1 ? String(page) : undefined, ...overrides }
      : { season, cuisine, cost: costBand, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    const qsStr = qs.toString();
    return qsStr ? `/recipes?${qsStr}` : '/recipes';
  };

  const searchJsonLd =
    searchMode && items.length > 0 ? buildSearchResultsPageJsonLd(q, items) : null;

  return (
    <>
      <Nav accent={ACCENT} />
      <main>
      <section className="section recipes-hub">
        <div className="section-head">
          <div className="kicker mono">— EVERY RECIPE</div>
          <h1 className="h-editorial">
            {searchMode ? `Recipes matching "${q}"` : 'Recipes'}
          </h1>
          <p className="lead">
            {searchMode
              ? `${resultTotal} ${resultTotal === 1 ? 'recipe' : 'recipes'} matching "${q}".`
              : `Browse ${total} chef-approved recipes. Sorted by season, scored by diversity.`}
          </p>
        </div>

        <form
          className="recipe-search mono"
          method="GET"
          action="/recipes"
          role="search"
        >
          <label className="recipe-search-label" htmlFor="recipe-search-q">
            Search recipes
          </label>
          <input
            id="recipe-search-q"
            className="recipe-search-input"
            type="search"
            name="q"
            placeholder="Search by recipe title…"
            defaultValue={q}
            autoComplete="off"
          />
          <button type="submit" className="recipe-search-submit">
            Search
          </button>
        </form>

        {!searchMode && (
          <nav className="recipe-filters mono" aria-label="Filter recipes">
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
        )}

        {searchMode && filteredTotal === 0 ? (
          <p className="recipe-grid-empty muted">
            No recipes match &ldquo;{q}&rdquo;. Try browsing{' '}
            <Link href="/recipes">all recipes</Link>.
          </p>
        ) : (
          <RecipeGrid items={items} />
        )}

        {totalPages > 1 && filteredTotal > 0 && (
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
        {!searchMode && filteredTotal === 0 && (season || cuisine || costBand) && (
          <p className="muted">
            No recipes match these filters yet.{' '}
            <Link href="/recipes" className="filter-opt">
              Reset
            </Link>
          </p>
        )}

        {/* Browse by cuisine — 17 curated cuisine landings. Sorted by
            recipe count desc so the biggest cuisines lead. Only rendered
            in browse mode (out of search results context). */}
        {!searchMode && (
          <section className="cuisine-browse" aria-labelledby="cuisine-browse-h">
            <div className="cuisine-browse-head">
              <div className="kicker mono">— BROWSE BY CUISINE</div>
              <h2 id="cuisine-browse-h" className="cuisine-browse-h">
                Browse by cuisine
              </h2>
            </div>
            <ul className="cuisine-grid">
              {[...CUISINE_SLUGS]
                .sort((a, b) => (CUISINE_COUNTS[b] ?? 0) - (CUISINE_COUNTS[a] ?? 0))
                .map((slug) => (
                  <li key={slug} className="cuisine-card-li">
                    <Link href={`/recipes/cuisine/${slug}`} className="cuisine-card">
                      <span className="cuisine-card-name">{CUISINE_META[slug].name}</span>
                      <span className="cuisine-card-count mono">
                        {CUISINE_COUNTS[slug]}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </section>
      </main>
      {searchJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(searchJsonLd) }}
        />
      )}
      <Footer />
    </>
  );
}
