// Sitemap index. Points crawlers at the per-section child sitemaps so we
// can submit / iterate on them independently in Search Console. The recipes
// child is the only one with real volume right now; /sitemap-shares.xml
// (one entry per /m/<code>) is parked until the v1.1 consent column lands.

import { SITE_ORIGIN } from '../lib/recipeSchema';

export const revalidate = 3600;

const CHILDREN = ['sitemap-static.xml', 'sitemap-recipes.xml'] as const;

export async function GET() {
  const lastmod = new Date().toISOString();
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    CHILDREN.map(
      (name) =>
        `  <sitemap>\n` +
        `    <loc>${SITE_ORIGIN}/${name}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `  </sitemap>`,
    ).join('\n') +
    '\n</sitemapindex>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
