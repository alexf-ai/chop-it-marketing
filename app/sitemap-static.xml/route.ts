// Static-route sitemap: the handful of routes that don't depend on
// recipes_published. Kept separate from /sitemap-recipes.xml so we can
// (re)submit either side independently in Search Console.

import { getAllPostsMeta } from '../lib/blog';
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
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.3' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3' },
  { path: '/data-deletion', changefreq: 'monthly', priority: '0.3' },
];

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return (
    `  <url>\n` +
    `    <loc>${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  );
}

export async function GET() {
  const now = new Date().toISOString();

  const staticEntries = ROUTES.map((r) =>
    urlEntry(`${SITE_ORIGIN}${r.path}`, now, r.changefreq, r.priority),
  );

  // Blog articles — metadata-only registry (no fs), safe to read here.
  // Per-article lastmod from dateModified so re-published edits resurface.
  const blogEntries = getAllPostsMeta().map((p) =>
    urlEntry(
      `${SITE_ORIGIN}/blog/${p.slug}`,
      new Date(`${p.dateModified}T00:00:00Z`).toISOString(),
      'monthly',
      '0.6',
    ),
  );

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...staticEntries, ...blogEntries].join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
