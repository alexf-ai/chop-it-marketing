# Motion library audit — chop-it.com marketing site

Audit completed prior to introducing the [Motion](https://motion.dev/) library (formerly Framer Motion). No code modified. No packages installed.

---

## 1. Stack versions

| Item | Value |
|---|---|
| **next** | `^15.5.15` |
| **react** | `18.3.1` |
| **react-dom** | `18.3.1` |
| **TypeScript** | `^5.4.5` (`tsconfig.json` present) |
| **Package manager** | `npm` (`package-lock.json` present; no `pnpm-lock.yaml`, no `yarn.lock`) |
| **`motion` already installed?** | **No** |
| **`framer-motion` already installed?** | **No** |
| **Tailwind CSS** | **Not installed.** No `tailwind.config.*`, no `postcss.config.*`. All styling lives in `app/styles/globals.css` (~2,400 lines, hand-written CSS with custom properties). |

---

## 2. App Router or Pages Router?

**App Router only.** `app/` directory exists; **no `pages/` directory**.

Top-level routes under `app/`:
- `app/page.tsx` — homepage (server component wrapper)
- `app/layout.tsx` — root layout with Organization JSON-LD, fonts, CookieBanner, NavTracker
- `app/recipes/page.tsx` — recipe hub (`/recipes`)
- `app/recipes/[slug]/page.tsx` — recipe detail (SSG, 1,024 slugs)
- `app/recipes/cuisine/[slug]/page.tsx` — 17 curated cuisine collection pages
- `app/recipes/collection/[slug]/page.tsx` — 11 editorial segment collection pages
- `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/data-deletion/page.tsx` — legal pages
- `app/api/revalidate/` — on-demand ISR webhook
- `app/m/[code]/` — shared menu deep-link
- `app/sitemap.xml/`, `app/sitemap-recipes.xml/`, `app/sitemap-static.xml/` — sitemap routes
- `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `app/twitter-image.tsx` — dynamic icon/OG routes
- `app/robots.ts` — robots.txt

---

## 3. Homepage structure

- **File path**: `app/page.tsx` (server component, async — pre-fetches demo data from Supabase)
- It returns a `<Home>` client component (`app/components/Home.tsx`) with the actual section composition. `<Home>` carries `'use client'` because of edit-mode `useState` / `postMessage` plumbing.

### Top-level sections in render order

| # | Component | File path | Client/Server | One-liner |
|---|---|---|---|---|
| 0 | `Nav` | `app/components/Nav.tsx` | `'use client'` | Sticky top nav: wordmark, anchor links (Diversity Score, Recipes, How it works, Feasts), and "Get the app" primary pill |
| 1 | `Hero` | `app/components/Hero.tsx` | `'use client'` | H1 + sub copy + separator + `PhoneSimulator` (interactive demo) + `DemoSearchBar` below |
| 2 | `CostBlock` | `app/components/CostBlock.tsx` | server | "£60/month wasted" full-bleed stat block, WRAP 2024 attribution |
| 3 | `WhatItDoes` | `app/components/WhatItDoes.tsx` | server | "Four things, done well" feature grid (#what anchor) |
| 4 | `PantrySection` | `app/components/PantrySection.tsx` | server | Wrapper around `PantryShowcase` (horizontal-scroll pantry ingredient cards from Supabase) |
| 5 | `ScoreExplainer` | `app/components/ScoreExplainer.tsx` | `'use client'` (slider) | Weekly Diversity Score: ring + 4-band tags + draggable score slider + pillar legend (#score anchor) |
| 6 | `FeaturedRecipes` | `app/components/FeaturedRecipes.tsx` | server | 6 recipe cards in a grid, top of `display_priority` (#recipes anchor) |
| 7 | `HowItWorks` | `app/components/HowItWorks.tsx` | server | 3-step "How it works" with `BrowseStepThumbs` recipe rows in step 01 |
| 8 | `Principles` | `app/components/Principles.tsx` | server | "Built on three ideas" — three editorial cards (Variety / Comfort / Hidden uplift) |
| 9 | `DownloadCTA` | `app/components/DownloadCTA.tsx` | `'use client'` (PostHog tracking) | Closing CTA — single pink-outlined "Download on the App Store" pill + sustainability anchor line |
| 10 | `Footer` | `app/components/Footer.tsx` | server | Footer grid (Product / Company / Social) |
| 11 | `Tweaks` *(conditional)* | `app/components/Tweaks.tsx` | `'use client'` | Dev-only overlay for `__activate_edit_mode` postMessage from Claude Design |

### Sub-components rendered inside Hero (relevant for motion targeting)
- `app/components/interactive-demo/PhoneSimulator.tsx` — animated phone-screen mock (This Week / Shop / Pantry tabs, ScoreRing, meal cards)
- `app/components/interactive-demo/DemoSearchBar.tsx` — `<input type="search">` that pushes to `/recipes?q=…`
- `app/components/ScoreRing.tsx` — three concentric SVG arcs (Plants/Fibre/Protein)

---

## 4. Existing animation / transition code

### CSS `transition` (all in `app/styles/globals.css`)
~16 sites. Standardised on `140ms ease` for chrome; a few `200ms ease` for cards/photos. Examples:
- `.btn` — transform / background / border-color / color (line 127)
- `.recipe-card` — transform on hover (line 670)
- `.nav-link-tertiary`, `.hero-cta-link`, `.recipe-back-link` — color + border-color
- `.store-pill`, `.cuisine-card` — border-color + transform on hover
- `.ring-wrap svg circle` — `stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)` (ScoreRing arc fill animation; declared inline in `ScoreRing.tsx` line 30)

### CSS `@keyframes`
Two named keyframes only:
1. **`pulse`** — green dot in the hero eyebrow ("NEW · WEEKLY DIVERSITY SCORE"), 2.4s infinite (globals.css line 171)
2. **`waitlist-sticky-rise`** — bottom sticky bar slide-up, 220ms (globals.css line 2238)

### CSS `animation:` declarations
Same two — the pulse and the waitlist sticky bar entrance.

### Tailwind `transition-*` / `animate-*` utilities
**None.** Tailwind isn't installed. All transitions/animations are hand-written CSS.

### Existing `motion.` usage
**None.** No `motion.div`, `motion.button`, no imports from `motion` or `framer-motion`. The animation surface is greenfield.

---

## 5. Reduced-motion handling

**Present, but narrow.** One block in `globals.css` (line 564):

```css
@media (prefers-reduced-motion: reduce) {
  .ring-wrap svg circle { transition: none !important; }
}
```

Only the ScoreRing arc fill transition is guarded. The pulse keyframe, the waitlist sticky rise, all the `.btn` / hover transforms, and the recipe-card translateY hover all keep firing for reduced-motion users. When Motion lands, a single global rule (or Motion's `useReducedMotion()` + `MotionConfig`) can do this properly.

---

## 6. Image components

`next/image` is used everywhere user-facing imagery surfaces:
- `Nav.tsx` — logo
- `Footer.tsx` — wordmark logo
- `Hero.tsx` (indirect via `PhoneSimulator`) — meal thumbnails
- `BrowseStepThumbs.tsx` — recipe thumbnails in step 01
- `FeaturedRecipes.tsx` — homepage featured-recipe cards
- `RecipeGrid.tsx` — every recipe card on hubs, collection pages, search results, and the "More from <segment>" footer on detail pages
- `PantryShowcase.tsx` — pantry ingredient cards
- `app/recipes/[slug]/page.tsx` — recipe hero image (priority + `fetchPriority="high"`)

**Implication for Motion**: animating `next/image` requires wrapping in a `motion.div` (or `motion('div')`). Don't use `motion.img` — `next/image` renders its own `<img>` plus a wrapper `<span>` and applies sizing styles; converting it to `motion.img` strips that machinery. The clean pattern is:

```tsx
<motion.div animate={…}>
  <Image src={…} alt={…} … />
</motion.div>
```

---

## 7. File tree (two levels deep)

```
chop-it-marketing/
├── README.md
├── audit/                              (audit notes — outside scope)
├── docs/                               (project docs)
├── instrumentation-client.ts           (PostHog client init)
├── lib/
│   ├── posthog-events.ts               (typed event helpers)
│   ├── supabase-public.ts              (anon Supabase client)
│   └── waitlist.ts                     (waitlist shared constants)
├── middleware.ts                       (410 Gone for /recipes/tag/* + /recipes/season/*)
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── posthog-setup-report.md
├── public/                             (logo.webp, logo.png — favicon sources)
├── supabase/                           (edge fns + migrations, deployed separately)
└── tsconfig.json
└── tsconfig.tsbuildinfo

app/
├── api/
│   └── revalidate/                     (on-demand ISR webhook)
├── apple-icon.tsx
├── components/
│   ├── BackLink.tsx
│   ├── Breadcrumbs.tsx
│   ├── BrowseStepThumbs.tsx
│   ├── CookieBanner.tsx
│   ├── CostBlock.tsx
│   ├── DishPlaceholder.tsx
│   ├── DownloadCTA.tsx
│   ├── FeaturedRecipes.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Home.tsx
│   ├── HowItWorks.tsx
│   ├── LegalLayout.tsx
│   ├── Nav.tsx
│   ├── NavTracker.tsx
│   ├── PantrySection.tsx
│   ├── PantryShowcase.tsx
│   ├── Principles.tsx
│   ├── RecipeCTA.tsx
│   ├── RecipeGrid.tsx
│   ├── RecipeViewTracker.tsx
│   ├── ScoreExplainer.tsx
│   ├── ScoreRing.tsx
│   ├── Tweaks.tsx
│   ├── WaitlistCounter.tsx              (rendered nowhere on the homepage — waitlist is hidden behind a feature gate)
│   ├── WaitlistForm.tsx                 (same)
│   ├── WaitlistStickyBar.tsx            (same)
│   ├── WhatItDoes.tsx
│   └── interactive-demo/
│       ├── DemoSearchBar.tsx
│       └── PhoneSimulator.tsx
├── data-deletion/page.tsx
├── icon.tsx
├── layout.tsx
├── lib/
│   ├── app-stores.ts                   (App Store / Play Store URL + IOS_LIVE / ANDROID_LIVE flags)
│   ├── collections.ts                  (11 editorial-segment slug→meta map)
│   ├── cuisines.ts                     (17 curated cuisine slug→meta map)
│   ├── homepageDemo.ts                 (server fetcher for PhoneSimulator)
│   ├── iso.ts                          (ISO duration helpers)
│   ├── pantry.ts                       (guest pantry loader)
│   ├── recipeSchema.ts                 (Recipe + BreadcrumbList JSON-LD builders)
│   ├── recipes.ts                      (Supabase loaders + the curated cuisine RPC wrapper)
│   ├── score.ts                        (Diversity-score band + coaching helpers)
│   ├── segments.ts                     (segment priority + recipeCategory mapping)
│   ├── sharedMenu.ts                   (shared-menu deep-link decoder)
│   └── supabase.ts                     (server Supabase client, env-gated)
├── m/[code]/                           (shared menu deep-link route)
├── opengraph-image.tsx
├── page.tsx
├── privacy/page.tsx
├── recipes/
│   ├── [slug]/page.tsx                 (1,024 SSG recipe detail pages)
│   ├── collection/[slug]/page.tsx      (11 editorial segment landings)
│   ├── cuisine/[slug]/page.tsx         (17 curated cuisine landings)
│   └── page.tsx                        (hub: search + filters + grid + "Browse by cuisine")
├── robots.ts
├── sitemap.xml/route.ts
├── sitemap-recipes.xml/route.ts        (recipes + cuisines + collections)
├── sitemap-static.xml/route.ts         (static pages)
├── styles/globals.css                  (~2,400 lines, no Tailwind)
├── terms/page.tsx
└── twitter-image.tsx
```

---

## Notes for the Motion integration

These are observations, not changes:

1. **No bundler config needed.** Motion supports Next.js 15 + React 18 out of the box. Install with `npm install motion`.
2. **Pick the right import.** From the Motion 12 line: `import { motion } from 'motion/react'` (the React-bindings export). The base `motion` import is framework-agnostic and won't give you the JSX wrappers.
3. **Client-component touch points.** Sections 0, 1, 5, 9, 11 are already `'use client'`. Sections 2–4 and 6–10 are server components. Motion components must render in a client tree — touching those server components means either adding `'use client'` to the component file or wrapping the animated subtree in a small client-only `<Animate>` shim.
4. **Reduced motion.** Wrap the app in `<MotionConfig reducedMotion="user">` from `motion/react` to inherit the user's OS preference automatically. The existing CSS-side `prefers-reduced-motion` rule (one block, ScoreRing only) can be expanded if specific custom keyframes need to be gated.
5. **Edit-mode iframe.** `Home.tsx` already runs in the Claude Design edit overlay via `postMessage`. Motion animations that depend on `IntersectionObserver` (e.g. `whileInView`) should still work inside the iframe; just confirm Vercel preview matches.
6. **PhoneSimulator + ScoreRing.** Both are SVG-heavy and already have hand-tuned transitions. Worth a design call before swapping these to Motion — the `stroke-dashoffset` ring fill is currently a CSS transition, easy to migrate but not necessary.

---

*Report generated 2026-05-21 from `feat/cuisine-collection-pages` codebase state (sha after PR #53).*
