// Recipes sitemap: every /recipes/<slug> plus the curated
// /recipes/collection/<segment> (11) and /recipes/cuisine/<slug> (17)
// landings. The free-text /recipes/tag/<x> and /recipes/season/<x>
// routes were retired (they returned 410 in middleware.ts) — they
// emitted ~700 unnormalised URLs that flooded crawl budget against the
// 1,024 actual recipe slugs, so they're gone from the sitemap too.

import { COLLECTION_SLUGS } from '../lib/collections';
import { CUISINE_SLUGS } from '../lib/cuisines';
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
  const { recipes } = await getRecipesSitemapData();
  const now = new Date().toISOString();
  const entries: string[] = [];

  // Stable lastmod for the hub and the curated landing pages: the most
  // recent recipe update. The recipes drive these pages' content, so this
  // moves only when recipe data actually changes — never on every revalidate
  // cycle. Stamping `now` here taught Google our <lastmod> was noise (the
  // same trap the static sitemap deliberately avoids). Falls back to `now`
  // only if there are no recipes (empty dataset).
  const latestRecipeUpdate =
    recipes.reduce<string>((max, r) => (r.updated_at > max ? r.updated_at : max), '') || now;
  const collectionsLastmod = new Date(latestRecipeUpdate).toISOString();

  // /recipes hub (also present in /sitemap-static.xml — keeping it here as
  // well so a crawler hitting just this file still sees the hub).
  entries.push(urlEntry('/recipes', collectionsLastmod, '0.8'));

  for (const { slug, updated_at } of recipes) {
    entries.push(
      urlEntry(`/recipes/${slug}`, updated_at ? new Date(updated_at).toISOString() : now, '0.6'),
    );
  }

  // Curated cuisine collection pages — 17 canonical slugs from
  // app/lib/cuisines.ts. Same priority (0.7) as segment collections;
  // these are top-of-funnel SEO landings, not raw taxonomy listings.
  for (const slug of [...CUISINE_SLUGS].sort()) {
    entries.push(urlEntry(`/recipes/cuisine/${slug}`, collectionsLastmod, '0.7'));
  }

  // Editorial collection pages. Higher priority (0.7) than individual
  // recipes (0.6) — these are top-of-funnel landing pages. Membership comes
  // from an offline pass rather than a recipe row's updated_at, so we use the
  // newest recipe update as a stable proxy: it shifts when the underlying
  // recipes change, not on every regeneration.
  for (const slug of [...COLLECTION_SLUGS].sort()) {
    entries.push(urlEntry(`/recipes/collection/${slug}`, collectionsLastmod, '0.7'));
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
