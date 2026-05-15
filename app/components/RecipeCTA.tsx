'use client';

// RecipeCTA — bottom-of-recipe call-to-action.
//
// Two store badges, App Store left, Google Play right. Google Play is
// hidden until Android is actually live (NEXT_PUBLIC_ANDROID_LIVE === 'true'),
// so we don't ship a dead pill the moment Android lands but before the
// app store listing goes live.
//
// Copy is deliberately native-only — SEO recipe pages exist to drive
// install, not to advertise the browser surface. Other entry points on
// the homepage already cover the web fallback.

import { trackAppStoreClick, trackPlayStoreClick } from '@/lib/posthog-events';

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '#';
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '#';
const ANDROID_LIVE = process.env.NEXT_PUBLIC_ANDROID_LIVE === 'true';

type RecipeCTAProps = {
  // Passed by the recipe detail page so app_store_click / play_store_click
  // events are attributable to the recipe in PostHog. Optional so the same
  // component can be used in non-recipe surfaces later without breakage.
  recipeSlug?: string;
  recipeTitle?: string;
};

export default function RecipeCTA({ recipeSlug, recipeTitle }: RecipeCTAProps = {}) {
  return (
    <section className="recipe-cta">
      <h2 className="recipe-cta-h">Cook this in Chop it</h2>
      <p className="recipe-cta-sub">
        Get the app to scan your fridge, plan the week, and shop in one tap.
      </p>
      <div className="recipe-cta-row">
        <a
          className="store-pill"
          href={APP_STORE_URL}
          aria-label="Download on the App Store"
          onClick={() =>
            trackAppStoreClick({
              recipe_slug: recipeSlug,
              recipe_title: recipeTitle,
              location: 'recipe_page',
            })
          }
        >
          <span className="store-pill-top mono">DOWNLOAD ON THE</span>
          <span className="store-pill-bot">App Store</span>
        </a>
        {ANDROID_LIVE && (
          <a
            className="store-pill"
            href={PLAY_STORE_URL}
            aria-label="Get it on Google Play"
            onClick={() =>
              trackPlayStoreClick({
                recipe_slug: recipeSlug,
                recipe_title: recipeTitle,
                location: 'recipe_page',
              })
            }
          >
            <span className="store-pill-top mono">GET IT ON</span>
            <span className="store-pill-bot">Google Play</span>
          </a>
        )}
      </div>
    </section>
  );
}
