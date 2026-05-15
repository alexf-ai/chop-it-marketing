'use client';

import posthog from 'posthog-js';

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

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? '#';
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '#';
const ANDROID_LIVE = process.env.NEXT_PUBLIC_ANDROID_LIVE === 'true';

export default function RecipeCTA() {
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
          onClick={() => posthog.capture('recipe_cta_clicked', { platform: 'ios' })}
        >
          <span className="store-pill-top mono">DOWNLOAD ON THE</span>
          <span className="store-pill-bot">App Store</span>
        </a>
        {ANDROID_LIVE && (
          <a
            className="store-pill"
            href={PLAY_STORE_URL}
            aria-label="Get it on Google Play"
            onClick={() => posthog.capture('recipe_cta_clicked', { platform: 'android' })}
          >
            <span className="store-pill-top mono">GET IT ON</span>
            <span className="store-pill-bot">Google Play</span>
          </a>
        )}
      </div>
    </section>
  );
}
