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
  // Real last-content-change date (YYYY-MM-DD). Bump a route ONLY when that
  // page actually changes — never stamp "now" on every regeneration, or
  // Google learns our <lastmod> is noise and stops trusting it for crawl
  // scheduling. Blog URLs derive their lastmod from the post registry below.
  lastmod: string;
};

// Priorities preserved from the previous monolithic sitemap.ts so we don't
// inadvertently re-rank pages with Google.
const ROUTES: StaticRoute[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: '2026-05-29' },
  { path: '/recipes', changefreq: 'weekly', priority: '0.8', lastmod: '2026-05-29' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.3', lastmod: '2026-05-29' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3', lastmod: '2026-05-29' },
  { path: '/data-deletion', changefreq: 'monthly', priority: '0.3', lastmod: '2026-05-29' },
];

// YYYY-MM-DD → W3C datetime (UTC midnight), a valid <lastmod> value.
function toIso(date: string): string {
  return new Date(`${date}T00:00:00Z`).toISOString();
}

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
  const staticEntries = ROUTES.map((r) =>
    urlEntry(`${SITE_ORIGIN}${r.path}`, toIso(r.lastmod), r.changefreq, r.priority),
  );

  // Blog: metadata-only registry (no fs), safe here. The /blog index tracks
  // the freshest article; each article uses its own dateModified. All stable
  // across regenerations — they only move when a post's date moves.
  const posts = getAllPostsMeta();
  const blogIndexLastmod = posts.reduce(
    (max, p) => (p.dateModified > max ? p.dateModified : max),
    '2026-05-29',
  );
  const blogEntries = [
    urlEntry(`${SITE_ORIGIN}/blog`, toIso(blogIndexLastmod), 'weekly', '0.7'),
    ...posts.map((p) =>
      urlEntry(`${SITE_ORIGIN}/blog/${p.slug}`, toIso(p.dateModified), 'monthly', '0.6'),
    ),
  ];

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...staticEntries, ...blogEntries].join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
