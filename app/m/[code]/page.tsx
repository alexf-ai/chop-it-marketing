// SSR share page — /m/<share_code>.
//
// Two share shapes resolve to the same URL pattern, in priority order:
//   1. Multi-recipe menu shares in `shared_menus` → renders a recipe grid
//      via the `get_shared_menu` SECURITY DEFINER RPC.
//   2. Individual recipe shares in `shared_links` → renders the full
//      recipe (ingredients + steps) from the embedded JSONB snapshot.
//
// One server-component round trip per page, then static HTML out. Full
// per-share OG + Twitter + canonical + JSON-LD (ItemList for menus,
// Recipe for single recipes) so each share is independently indexable.
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
import { getSharedRecipe, type SharedRecipePayload } from '@/app/lib/sharedRecipe';
import { SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 300;

const APP_DEEP_LINK_BASE = 'https://chopit.app/m';
const WAITLIST_URL = 'https://chop-it.com/#waitlist';

type ResolvedShare =
  | { kind: 'menu'; payload: SharedMenuPayload }
  | { kind: 'recipe'; payload: SharedRecipePayload };

async function resolveShare(code: string): Promise<ResolvedShare | null> {
  const menu = await getSharedMenu(code);
  if (menu) return { kind: 'menu', payload: menu };
  const recipe = await getSharedRecipe(code);
  if (recipe) return { kind: 'recipe', payload: recipe };
  return null;
}

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

function buildRecipeJsonLd(payload: SharedRecipePayload): Record<string, unknown> {
  const code = payload.share_code;
  const url = `${SITE_ORIGIN}/m/${code}`;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: payload.title,
    url,
  };
  if (payload.description) ld.description = payload.description;
  if (payload.image_url) ld.image = [payload.image_url];
  if (payload.servings) ld.recipeYield = `${payload.servings} servings`;
  if (payload.cuisine) ld.recipeCuisine = payload.cuisine;
  const prepISO = isoDurationFromMinutes(payload.prep_minutes);
  const cookISO = isoDurationFromMinutes(payload.cook_minutes);
  const totalISO = isoDurationFromMinutes(payload.total_minutes);
  if (prepISO) ld.prepTime = prepISO;
  if (cookISO) ld.cookTime = cookISO;
  if (totalISO) ld.totalTime = totalISO;
  if (payload.ingredients.length > 0) {
    ld.recipeIngredient = payload.ingredients.map((i) => i.display);
  }
  if (payload.steps.length > 0) {
    ld.recipeInstructions = payload.steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    }));
  }
  if (payload.tags.length > 0) ld.keywords = payload.tags.join(', ');
  return ld;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code: raw } = await params;
  const code = normaliseShareCode(raw);
  if (!code) return { title: 'Share not found · Chop it', robots: { index: false } };

  const resolved = await resolveShare(code);
  if (!resolved) {
    return {
      title: 'Share not found · Chop it',
      robots: { index: false },
    };
  }

  const url = `${SITE_ORIGIN}/m/${code}`;

  if (resolved.kind === 'menu') {
    const payload = resolved.payload;
    const title = `${payload.collection.name} — A menu on Chop It`;
    const recipeTitles = payload.recipes
      .map((r) => r.title)
      .filter((t): t is string => Boolean(t && t.trim()))
      .slice(0, 3);
    const description = recipeTitles.length
      ? `A ${payload.recipes.length}-recipe menu: ${recipeTitles.join(', ')}…`
      : `A ${payload.recipes.length}-recipe menu shared from Chop it.`;
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
      twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    };
  }

  const recipe = resolved.payload;
  const title = `${recipe.title} — A recipe on Chop It`;
  const description = recipe.description ?? `${recipe.title}, shared from Chop it.`;
  const ogImage = recipe.image_url ?? `${SITE_ORIGIN}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: 'Chop it',
      images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function SharedPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = normaliseShareCode(raw);
  if (!code) notFound();

  const resolved = await resolveShare(code);
  if (!resolved) notFound();

  const deepLink = `${APP_DEEP_LINK_BASE}/${code}`;

  if (resolved.kind === 'menu') {
    return <MenuView payload={resolved.payload} deepLink={deepLink} />;
  }
  return <RecipeView payload={resolved.payload} deepLink={deepLink} />;
}

function MenuView({
  payload,
  deepLink,
}: {
  payload: SharedMenuPayload;
  deepLink: string;
}) {
  const jsonLd = buildItemListJsonLd(payload);
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="share-menu">
        <div className="share-menu-head">
          <div className="share-menu-eyebrow mono">SHARED MENU · {payload.share_code}</div>
          <h1 className="share-menu-h">{payload.collection.name}</h1>
          <p className="share-menu-sub">
            {payload.recipes.length} {payload.recipes.length === 1 ? 'recipe' : 'recipes'}, sorted
            into a one-tap shop.
          </p>
          <div className="share-menu-cta-row">
            <a className="btn btn-primary" href={deepLink} target="_blank" rel="noopener noreferrer">
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
                  <img src={r.image_url} alt={r.title ?? ''} loading="lazy" className="share-menu-card-img" />
                ) : (
                  <div className="share-menu-card-img share-menu-card-img-fallback" aria-hidden />
                )}
                <div className="share-menu-card-body">
                  <div className="share-menu-card-title">{r.title ?? 'Recipe'}</div>
                  <div className="share-menu-card-meta mono">
                    {[
                      r.cuisine,
                      r.total_minutes ? `${r.total_minutes} min` : null,
                      r.servings ? `Serves ${r.servings}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ShareFooter deepLink={deepLink} ctaLabel="Open this menu in the app" />
      </main>
    </>
  );
}

function RecipeView({
  payload,
  deepLink,
}: {
  payload: SharedRecipePayload;
  deepLink: string;
}) {
  const jsonLd = buildRecipeJsonLd(payload);
  const metaBits = [
    payload.total_minutes ? `${payload.total_minutes} min` : null,
    payload.servings ? `Serves ${payload.servings}` : null,
    payload.cuisine,
  ].filter(Boolean) as string[];

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="share-menu share-recipe">
        <div className="share-menu-head share-recipe-head">
          <div className="share-menu-eyebrow mono">SHARED RECIPE · {payload.share_code}</div>
          <h1 className="share-menu-h">{payload.title}</h1>
          {payload.description ? (
            <p className="share-menu-sub">{payload.description}</p>
          ) : null}
          {metaBits.length > 0 ? (
            <div className="share-recipe-meta mono">{metaBits.join(' · ')}</div>
          ) : null}
          <div className="share-menu-cta-row">
            <a className="btn btn-primary" href={deepLink} target="_blank" rel="noopener noreferrer">
              Open in Chop It app
            </a>
            <Link className="btn btn-ghost" href="/">
              What is Chop It?
            </Link>
          </div>
        </div>

        {payload.image_url ? (
          // Unoptimised on purpose — see file header.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={payload.image_url} alt={payload.title} className="share-recipe-hero" />
        ) : null}

        <div className="share-recipe-body">
          <section className="share-recipe-ingredients">
            <h2 className="share-recipe-h2">Ingredients</h2>
            {payload.ingredients.length === 0 ? (
              <p className="share-menu-empty">No ingredients listed.</p>
            ) : (
              <ul className="share-recipe-ingredients-list">
                {payload.ingredients.map((i, idx) => (
                  <li key={idx}>
                    {i.display}
                    {i.optional ? <span className="share-recipe-optional"> (optional)</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="share-recipe-steps">
            <h2 className="share-recipe-h2">Method</h2>
            {payload.steps.length === 0 ? (
              <p className="share-menu-empty">No method written yet.</p>
            ) : (
              <ol className="share-recipe-steps-list">
                {payload.steps.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <ShareFooter deepLink={deepLink} ctaLabel="Open this recipe in the app" />
      </main>
    </>
  );
}

function ShareFooter({ deepLink, ctaLabel }: { deepLink: string; ctaLabel: string }) {
  return (
    <section className="share-menu-footer">
      <h2 className="share-menu-footer-h">Built with Chop It.</h2>
      <p className="share-menu-footer-sub">
        Chop it plans your week, writes the shop, and quietly nudges you toward more variety —
        without giving up the meals you love.
      </p>
      <div className="share-menu-cta-row">
        <a className="btn btn-primary" href={WAITLIST_URL} rel="noopener">
          Try Chop It — it&rsquo;s free
        </a>
        <a className="btn btn-ghost" href={deepLink} target="_blank" rel="noopener noreferrer">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
