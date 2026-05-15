# Chop it — marketing site

Next.js App Router implementation of the Chop it marketing homepage (chop-it.com).

Sourced from a Claude Design handoff bundle; dark editorial theme, three fonts
(Instrument Serif display / Geist UI / JetBrains Mono meta), interactive
Weekly Diversity Score ring and slider, phone mock in hero, four-up feature
grid, featured recipes, three-step how-it-works, team quotes, final CTA, footer,
and a live `Tweaks` panel bound to the edit-mode postMessage protocol.

## Develop

```bash
npm install
npm run dev
```

Opens at http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## Structure

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, global styles)
- `app/components/` — server + client components
- `app/styles/globals.css` — ported verbatim from the design bundle

Client components (`'use client'`): `Home`, `Hero`, `ScoreExplainer`, `Tweaks` —
anything with state, effects, or the score slider. Everything else renders on the
server.

## Analytics

This site sends events to the **chopit-marketing** PostHog project (NOT
chopit-product). EU Cloud (`https://eu.posthog.com`).

Install was done via the official PostHog wizard:

```bash
npx -y @posthog/wizard@latest --region eu
```

The wizard wired up:

- `posthog-js` dependency
- `instrumentation-client.ts` (Next 15 convention — auto-initialises the
  client SDK; uses the `'2026-01-30'` defaults preset which handles App
  Router pageview tracking automatically — no manual route-change wiring)
- `/ingest/*` reverse-proxy rewrites in `next.config.mjs` (bypasses
  ad-blockers; ingestion routes through chop-it.com)

Custom conversion events live in [`lib/posthog-events.ts`](lib/posthog-events.ts).
Components call typed helpers (`trackAppStoreClick`, `trackPlayStoreClick`,
`trackNavCtaClick`, `trackRecipeView`) so the event taxonomy stays in
one place. **Never** call `posthog.capture` inline in a component — add a
helper.

Recipe detail pages mount `<RecipeViewTracker />` which fires a single
`recipe_view` event on first paint with the full recipe context (`recipe_id`,
`recipe_slug`, `recipe_title`, `cuisine`, `season`, `cost_band`,
`has_nutrition`, `referrer`).

UTM parameters are auto-captured by PostHog. No code required.

### Test locally

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.
2. `npm run dev` and open http://localhost:3000.
3. In browser devtools console: `posthog.debug()` then reload.
4. Watch [PostHog Live Events](https://eu.posthog.com/project/180088/activity/explore)
   — `$pageview` should land within 30s.

### Privacy / consent

A first-visit cookie banner ([`app/components/CookieBanner.tsx`](app/components/CookieBanner.tsx))
offers Accept / Decline. Decline calls `posthog.opt_out_capturing()` and
stores the choice in `localStorage` under `chopit_cookie_choice`. The
banner does not appear again after a choice is made.

PostHog reference: <https://posthog.com/docs/libraries/next-js>.

