// 410 Gone for legacy taxonomies.
//
// /recipes/tag/* and /recipes/season/* were the free-text taxonomy routes
// driven by the raw tags_json.core[] array. They generated ~700 sitemap
// URLs from unnormalised user-supplied values ("30 minutes",
// "American-Italian", "Family", etc.) and were poisoning crawl budget —
// GSC May 2026 had 461 of these flagged "Discovered – currently not
// indexed" against only 28 indexed real recipe slugs.
//
// We retired both routes in favour of the curated
// /recipes/collection/[segment] (11 editorial segments) and
// /recipes/cuisine/[slug] (17 canonical cuisines) landings. 410 Gone is
// the right signal here: it tells Google these URLs are permanently
// removed and to drop them from the index. We don't 301 because Google
// has barely indexed any (3 cuisine + 3 tag pages), so redirect equity
// is negligible vs the noise of mapping garbage strings onto curated
// destinations.

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return new NextResponse(null, {
    status: 410,
    statusText: 'Gone',
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

export const config = {
  matcher: ['/recipes/tag/:path*', '/recipes/season/:path*'],
};
