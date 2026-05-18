// Recipes sitemap: every /recipes/<slug> plus the /recipes/cuisine/<x>,
// /recipes/season/<x>, /recipes/tag/<x> hubs. The hub <lastmod> values are
// the most recent updated_at across recipes in that grouping (aggregated
// once in getRecipesSitemapData so we don't N+1 the DB).
//
// URL-safety filter (URL_SAFE_SLUG_RE) is applied inside
// getRecipesSitemapData — taxonomy values containing spaces / punctuation
// are excluded for the same reason generateStaticParams excludes them in
// /recipes/{tag,cuisine}/[…]/page.tsx. Keep these two in lockstep.

import { COLLECTION_SLUGS } from '../lib/collections';
import { getRecipesSitemapData } from '../lib/recipes';
import { SITE_ORIGIN } from '../lib/recipeSchema';

export const revalidate = 3600;

function urlEntry(path: string, lastmod: string, priority: string): string {
  return (
    `  <url>\n` +
    `    <loc>${SITE_ORIGIN}${path}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>weekly</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  );
}

export async function GET() {
  const { recipes, cuisines, tags, seasons } = await getRecipesSitemapData();
  const now = new Date().toISOString();
  const entries: string[] = [];

  // /recipes hub (also present in /sitemap-static.xml — keeping it here as
  // well so a crawler hitting just this file still sees the hub).
  entries.push(urlEntry('/recipes', now, '0.8'));

  for (const { slug, updated_at } of recipes) {
    entries.push(
      urlEntry(`/recipes/${slug}`, updated_at ? new Date(updated_at).toISOString() : now, '0.6'),
    );
  }

  // Map iteration order is insertion-time; sort so the file is stable
  // diff-to-diff (Search Console treats sitemap re-ordering as a change).
  const sorted = (m: Map<string, string>) =>
    Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));

  for (const [cuisine, ts] of sorted(cuisines)) {
    entries.push(
      urlEntry(
        `/recipes/cuisine/${encodeURIComponent(cuisine)}`,
        new Date(ts).toISOString(),
        '0.5',
      ),
    );
  }
  for (const [season, ts] of sorted(seasons)) {
    entries.push(
      urlEntry(
        `/recipes/season/${encodeURIComponent(season)}`,
        new Date(ts).toISOString(),
        '0.5',
      ),
    );
  }
  for (const [tag, ts] of sorted(tags)) {
    entries.push(
      urlEntry(`/recipes/tag/${encodeURIComponent(tag)}`, new Date(ts).toISOString(), '0.5'),
    );
  }

  // Editorial collection pages. Higher priority (0.7) than individual
  // recipes (0.6) — these are top-of-funnel landing pages. Lastmod is
  // `now` because the curated segment membership comes from an offline
  // pass, not a recipe row's updated_at; we accept that lastmod will
  // refresh on every revalidate cycle.
  for (const slug of [...COLLECTION_SLUGS].sort()) {
    entries.push(urlEntry(`/recipes/collection/${slug}`, now, '0.7'));
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
