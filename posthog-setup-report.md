<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Chop It marketing site. The following changes were made:

- **`instrumentation-client.ts`** (new) — Initialises PostHog client-side via the Next.js 15.3+ instrumentation hook. Configured with EU host, reverse-proxy ingestion, exception capture, and debug mode in development.
- **`next.config.mjs`** — Added `/ingest/*` reverse-proxy rewrites routing PostHog traffic through the site domain, plus `skipTrailingSlashRedirect: true`.
- **`app/components/Hero.tsx`** — Converted to `'use client'`. Tracks `app_cta_clicked` on "Try the web app" and `how_it_works_clicked` on "See how it works →".
- **`app/components/Nav.tsx`** — Converted to `'use client'`. Tracks `nav_cta_clicked` with `cta_type: 'get_app' | 'sign_in'`.
- **`app/components/DownloadCTA.tsx`** — Converted to `'use client'`. Tracks `app_cta_clicked` on App Store, Play Store, and web app CTAs with `cta_location: 'download_cta'`.
- **`app/components/RecipeCTA.tsx`** — Already `'use client'`. Added `recipe_cta_clicked` tracking with `platform: 'ios' | 'android'`.
- **`app/components/RecipeViewTracker.tsx`** (new) — Lightweight client component that fires `recipe_viewed` on mount, used by the recipe detail page to track funnel entry.
- **`app/recipes/[slug]/page.tsx`** — Imports and renders `RecipeViewTracker` to fire `recipe_viewed` with `recipe_slug` and `recipe_title`.

| Event | Description | File |
|---|---|---|
| `app_cta_clicked` | User clicked a download/try CTA (hero or download section) | `app/components/Hero.tsx`, `app/components/DownloadCTA.tsx` |
| `how_it_works_clicked` | User clicked "See how it works →" in the hero | `app/components/Hero.tsx` |
| `nav_cta_clicked` | User clicked "Get the app" or "Sign in" in the nav | `app/components/Nav.tsx` |
| `recipe_cta_clicked` | User clicked App Store/Play Store CTA on a recipe page | `app/components/RecipeCTA.tsx` |
| `recipe_viewed` | User viewed a recipe detail page (top of install funnel) | `app/recipes/[slug]/page.tsx` via `RecipeViewTracker` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://eu.posthog.com/project/180088/dashboard/684366)
- [App CTA clicks over time](https://eu.posthog.com/project/180088/insights/AHwStseP) — daily trend of all download/try CTA clicks
- [App CTA clicks by destination](https://eu.posthog.com/project/180088/insights/Yqmqu7R7) — breakdown by web app, App Store, Play Store
- [Recipe → App install funnel](https://eu.posthog.com/project/180088/insights/QRw0kYbR) — conversion from recipe view to app download CTA
- [Recipe views over time](https://eu.posthog.com/project/180088/insights/DalZqotS) — daily recipe page views (funnel entry)
- [Nav CTA clicks by type](https://eu.posthog.com/project/180088/insights/yOkCzPTX) — "Get the app" vs "Sign in" split

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
