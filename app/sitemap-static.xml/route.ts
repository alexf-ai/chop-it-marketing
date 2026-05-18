// Static-route sitemap: the handful of routes that don't depend on
// recipes_published. Kept separate from /sitemap-recipes.xml so we can
// (re)submit either side independently in Search Console.

import { SITE_ORIGIN } from '../lib/recipeSchema';

export const revalidate = 3600;

type StaticRoute = {
  path: string;
  changefreq: 'weekly' | 'monthly';
  priority: string;
};

// Priorities preserved from the previous monolithic sitemap.ts so we don't
// inadvertently re-rank pages with Google.
const ROUTES: StaticRoute[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/recipes', changefreq: 'weekly', priority: '0.8' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.3' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3' },
  { path: '/data-deletion', changefreq: 'monthly', priority: '0.3' },
];

export async function GET() {
  const lastmod = new Date().toISOString();
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ROUTES.map(
      (r) =>
        `  <url>\n` +
        `    <loc>${SITE_ORIGIN}${r.path}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority}</priority>\n` +
        `  </url>`,
    ).join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
