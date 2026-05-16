// SSR share-menu page — /m/<share_code>.
//
// One server-component round trip via the `get_shared_menu` SECURITY
// DEFINER RPC, then static HTML out. Renders the menu title, a recipe
// grid, and CTAs back to chopit.app (open in app) and chop-it.com waitlist
// (try Chop It). Full per-share OG + Twitter + canonical + ItemList JSON-LD
// metadata so each share is independently indexable.
//
// Image grid uses native <img> rather than next/image because the user-
// recipe images live on imagedelivery.net/Cloudflare and Supabase storage
// — adding both to next.config.mjs's remotePatterns would be a wider
// change than this route warrants, and the share page is one-shot rather
// than a hot loop so the unoptimised image is fine.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getSharedMenu, normaliseShareCode, type SharedMenuPayload } from '@/app/lib/sharedMenu';
import { SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 300;

const APP_DEEP_LINK_BASE = 'https://chopit.app/m';
const WAITLIST_URL = 'https://chop-it.com/#waitlist';

function isoDurationFromMinutes(mins: number | null | undefined): string | null {
  if (mins == null || !Number.isFinite(mins) || mins <= 0) return null;
  return `PT${Math.round(mins)}M`;
}

function buildItemListJsonLd(payload: SharedMenuPayload): Record<string, unknown> {
  const code = payload.share_code;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: payload.collection.name,
    numberOfItems: payload.recipes.length,
    url: `${SITE_ORIGIN}/m/${code}`,
    itemListElement: payload.recipes.map((r, idx) => {
      // Each Recipe must have a unique URL or Google's Carousel rich-result
      // validator rejects the ItemList ("Identical property values given,
      // but unique values are required"). The deep link still points at the
      // menu — the recipe id becomes a fragment so the URL is technically
      // unique per item without inventing a new in-app route.
      const recipe: Record<string, unknown> = {
        '@type': 'Recipe',
        name: r.title ?? 'Recipe',
        url: `${APP_DEEP_LINK_BASE}/${code}#recipe-${r.id}`,
      };
      if (r.image_url) recipe.image = r.image_url;
      if (r.cuisine) recipe.recipeCuisine = r.cuisine;
      const totalISO = isoDurationFromMinutes(r.total_minutes);
      if (totalISO) recipe.totalTime = totalISO;
      if (r.servings) recipe.recipeYield = `${r.servings} servings`;
      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: recipe,
      };
    }),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code: raw } = await params;
  const code = normaliseShareCode(raw);
  if (!code) return { title: 'Menu not found · Chop it', robots: { index: false } };

  const payload = await getSharedMenu(code);
  if (!payload) {
    return {
      title: 'Menu not found · Chop it',
      robots: { index: false },
    };
  }

  const title = `${payload.collection.name} — A menu on Chop It`;
  const recipeTitles = payload.recipes
    .map((r) => r.title)
    .filter((t): t is string => Boolean(t && t.trim()))
    .slice(0, 3);
  const description = recipeTitles.length
    ? `A ${payload.recipes.length}-recipe menu: ${recipeTitles.join(', ')}…`
    : `A ${payload.recipes.length}-recipe menu shared from Chop it.`;

  const url = `${SITE_ORIGIN}/m/${code}`;
  const firstRecipeImage = payload.recipes.find((r) => Boolean(r.image_url))?.image_url ?? null;
  const ogImage = firstRecipeImage ?? `${SITE_ORIGIN}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Chop it',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharedMenuPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = normaliseShareCode(raw);
  if (!code) notFound();

  const payload = await getSharedMenu(code);
  if (!payload) notFound();

  const jsonLd = buildItemListJsonLd(payload);
  const deepLink = `${APP_DEEP_LINK_BASE}/${code}`;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="share-menu">
        <div className="share-menu-head">
          <div className="share-menu-eyebrow mono">SHARED MENU · {code}</div>
          <h1 className="share-menu-h">{payload.collection.name}</h1>
          <p className="share-menu-sub">
            {payload.recipes.length} {payload.recipes.length === 1 ? 'recipe' : 'recipes'}, sorted
            into a one-tap shop.
          </p>
          <div className="share-menu-cta-row">
            <a
              className="btn btn-primary"
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Chop It app
            </a>
            <Link className="btn btn-ghost" href="/">
              What is Chop It?
            </Link>
          </div>
        </div>

        {payload.recipes.length === 0 ? (
          <p className="share-menu-empty">This menu doesn&rsquo;t have any recipes yet.</p>
        ) : (
          <ul className="share-menu-grid">
            {payload.recipes.map((r) => (
              <li key={r.id} className="share-menu-card">
                {r.image_url ? (
                  // Unoptimised on purpose — see file header.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image_url}
                    alt=""
                    loading="lazy"
                    className="share-menu-card-img"
                  />
                ) : (
                  <div className="share-menu-card-img share-menu-card-img-fallback" aria-hidden />
                )}
                <div className="share-menu-card-body">
                  <div className="share-menu-card-title">{r.title ?? 'Recipe'}</div>
                  <div className="share-menu-card-meta mono">
                    {[r.cuisine, r.total_minutes ? `${r.total_minutes} min` : null,
                      r.servings ? `Serves ${r.servings}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <section className="share-menu-footer">
          <h2 className="share-menu-footer-h">Built with Chop It.</h2>
          <p className="share-menu-footer-sub">
            Chop it plans your week, writes the shop, and quietly nudges you toward more variety —
            without giving up the meals you love.
          </p>
          <div className="share-menu-cta-row">
            <a
              className="btn btn-primary"
              href={WAITLIST_URL}
              rel="noopener"
            >
              Try Chop It — it&rsquo;s free
            </a>
            <a
              className="btn btn-ghost"
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open this menu in the app
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
