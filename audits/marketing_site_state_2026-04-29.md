# Marketing site state audit — 2026-04-29

Repo: `AlexF-AI/chop-it-marketing` (Next.js App Router on Vercel, separate from main app).
Branch: `claude/audit-marketing-site-A0ALG`.

This is an audit of the deployed marketing site against the marketing-site spec
and against the two visible bugs reported (wrong logo on mobile, recipe images
rendering as diagonal-stripe placeholders). **No code changes have been made.**
Section 2 proposes fixes for review; section 3 enumerates spec drift (read-only).

---

## 1. Current state

### 1.1 Recipe data flow

**Path: `app/page.tsx` → `app/components/FeaturedRecipes.tsx` → Supabase
`recipes_published`.**

`app/page.tsx:1-6` renders `<Home featuredRecipes={<FeaturedRecipes />} />`.
`FeaturedRecipes` is an **async server component** with
`export const revalidate = 3600` (ISR, 1-hour cache).

`app/components/FeaturedRecipes.tsx:32-50` queries Supabase as follows:

```ts
const { data, error } = await supabase
  .from('recipes_published')
  .select('id, title, image_url, season, display_priority')
  .eq('season', 'summer')
  .not('image_url', 'is', null)
  .order('display_priority', { ascending: false })
  .limit(6);
```

If `error` is non-null, or `data` is `null`/empty, it returns `null` and the
component falls back to a hardcoded `PLACEHOLDERS` array
(`FeaturedRecipes.tsx:15-22`) rendered through `DishPlaceholder`
(`app/components/DishPlaceholder.tsx`), which is the diagonal-stripe SVG.

The fallback titles are:

- "Harissa butter beans, whipped feta, crispy shallots"
- "Miso-glazed aubergine, sesame greens, jasmine rice"
- "Lemon chicken orzo, charred courgette, dill"
- "Smoky black bean tacos, pickled onion slaw"
- "Crispy gnocchi, brown butter sage, walnuts"
- "Cod with lentils, salsa verde, blistered tomatoes"

These match exactly the titles you observed on the live site, which
confirms **the live site is rendering the placeholder fallback path, not the
Supabase path.**

The Supabase client is instantiated in `app/lib/supabase.ts:1-15` from
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If either is
missing, the module **throws at import time** — meaning a missing env var would
fail the build entirely, not silently fall back. So the env vars must be set
*at build time* (otherwise the build would error). The fallback is being
triggered by either (a) the runtime fetch failing post-build, or (b) the cached
ISR result being a fallback baked in at build time.

### 1.2 Database state — does the query actually have data to return?

Confirmed live against project `elirehiikubpbfyjzwky` (`recipes_published`):

| Check | Result |
|---|---|
| Total rows | 1,187 |
| Not soft-deleted (`deleted_at IS NULL`) | 1,040 |
| `image_url` populated | 1,187 (100%) |
| `cloudflare_image_id` populated | 1,187 (100%) |
| `image_key` populated | 1,187 (100%) |
| `season = 'summer'` | 189 |
| `season = NULL` | 998 |
| RLS enabled on `recipes_published` | **No** |
| `anon` role has `SELECT` privilege | **Yes** |

The query as written — `season = 'summer'` AND `image_url IS NOT NULL`
ordered by `display_priority` — returns 6 valid rows. Sample of what it
returns:

```
Rice Paper Rolls with Prawns and Fresh Herbs
Rainbow Grain Bowl with Tahini Dressing
Grilled Salmon with Dill Yoghurt and Cucumber Salad
One-Pan Orzo with Roasted Peppers, Olives and Feta
Crispy Skin Sea Bass with Samphire and Crushed Potatoes
Herby Falafel with Tahini and Pickled Veg
```

`image_url` values are full Cloudflare Images delivery URLs of the form
`https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/<image_id>/<variant>` — the
URL is **already fully constructed in the database**, no client-side assembly
needed.

**Conclusion: the query is correct, the data exists, RLS isn't blocking, and
the URLs are valid Cloudflare delivery URLs. The fallback is being triggered
either because the request from the build/runtime never reaches Supabase
successfully, or because the deployed bundle was built without the env vars
and silently hit the fallback path at build time** (which would also require
the throw in `lib/supabase.ts` to have been bypassed somehow — flagged as
inconsistency below).

### 1.3 Image rendering

`FeaturedRecipes.tsx:69-75` renders `<Image src={r.image_url} ... />` (Next.js
`next/image`). `r.image_url` is the full `https://imagedelivery.net/...` URL
from Supabase.

`next.config.mjs:4-9` allowlists the right hosts:

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'imagedelivery.net' },
    { protocol: 'https', hostname: 'elirehiikubpbfyjzwky.supabase.co' },
  ],
},
```

Both the Cloudflare Images delivery host and the Supabase storage host are
permitted, so `next/image` will not reject the URL.

A sample URL fetched from the DB:
`https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/c61e50bf-fe3c-4204-b7f0-927ef7471200`
— this is the standard Cloudflare Images delivery pattern; the URL is
publicly accessible (no signed URL infra in use).

**Conclusion: the image-rendering code path is correct. The only reason no
images render is that `recipes` is `null` and the placeholder fallback runs
instead.**

### 1.4 Logo

Used in two places:

- `app/components/Nav.tsx:10-19` — `<Image src="/logo.webp" width=28 height=28 />`
- `app/components/Footer.tsx:9-16` — `<Image src="/logo.webp" width=40 height=40 />`

Assets in `public/`:

- `public/logo.png` (1024×1024 PNG, ~1.2 MB)
- `public/logo.webp` (~92 KB)

Both files render the same icon: a stylised cleaver with a pink magenta
handle, a thick black outline, a black dot near the top of the handle (the
hole/rivet detail), and a smaller black dot on the blade. This appears to be
the "cleaver-with-tag" icon you flagged — the dot on the blade reads as a
price-tag-style dot. It does **not** match the cleaver mark used in the
production app.

The correct logo is not in this repo. There's no SVG inline, no exported
component from a shared design package, no CDN reference. The Nav and Footer
both load the same `/logo.webp` from this repo's `public/` folder.

---

## 2. Proposed fixes

### 2.1 Recipe images — root cause + fix

The code path is correct. The most likely root cause of the
placeholder fallback is one of:

1. **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set in
   the Vercel project's Production env vars.** This is the brief's flagged
   halt condition for ops issues. Resolution is in the Vercel dashboard, not
   in code.
2. **Env vars set but invalid** (wrong project URL, wrong anon key, expired
   key) — the runtime fetch returns 401/404 and the catch falls through to
   placeholders. The current `console.warn` only logs server-side, not
   visible in the browser, so this would be silent on the live site.
3. **Build succeeded with env vars present, but the build-time ISR snapshot
   captured an error path** (e.g., a transient network failure during the
   Vercel build), and the 1-hour `revalidate` window hasn't naturally
   refreshed because traffic is low.

To distinguish (1) from (2)/(3), the audit needs **Vercel build/runtime logs
or a Production env var inspection** — neither of which I can do from the
codebase. Halting per the brief's ops-fix condition.

**If the env vars turn out to be present and valid**, the fix is purely a
deployment refresh (redeploy or curl the site to bust the ISR cache). No
code change required.

**If the env vars are missing/wrong**, the fix is to set them in Vercel
Production:

```
NEXT_PUBLIC_SUPABASE_URL=https://elirehiikubpbfyjzwky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase project settings>
```

…and trigger a redeploy. No code change.

**Recommended code change regardless** — make the failure mode louder and
more debuggable:

| File | Change |
|---|---|
| `app/components/FeaturedRecipes.tsx:42-48` | Include `error.code`, `error.details`, `error.hint` in the warn so Vercel logs surface the cause (PostgREST 401 vs. column-not-found vs. RLS block reads very differently). |
| `app/lib/supabase.ts:6-10` | Soften the import-time throw to a runtime warn — with the current behaviour, a missing env var fails the *build* with a stack trace, but if the build environment has the var and Production runtime does not, the symptom is silent. Optionally, fall back to a noop client that returns errors on every call, so the FeaturedRecipes fallback is exercised cleanly. (Open question: is failing the build the better behaviour? Arguable both ways — flag for review.) |

Neither of those fixes the visible bug. Both make the next bug easier to
diagnose. Apply only if you want them.

### 2.2 Recipe images — schema observation

`recipes_published.image_url` is fully populated as Cloudflare delivery URLs.
The current query reading `image_url` directly is correct and should not be
changed. (You'd only need to construct URLs from `cloudflare_image_id` if
`image_url` were null or wrong, which it isn't.) No change to the query
shape.

One small ambiguity — the query filters `season = 'summer'`. 998 rows have
`season = NULL`, only 189 are tagged `'summer'` and zero are tagged anything
else. If you want to surface "any seasonable recipe" on the marketing page,
this filter excludes most of the catalogue. Up to you whether that's the
intended editorial choice. Not changing it as part of this audit.

### 2.3 Logo — fix

Mechanical swap. The work is:

1. Source the correct cleaver logo file from the chop-it-app repo (the SVG
   or PNG that ships with the production app — the file used for the app
   icon and the in-app wordmark).
2. Drop it into `public/logo.webp` (and `public/logo.png` if a PNG fallback
   is needed). Keep filenames the same so `Nav.tsx` and `Footer.tsx` don't
   need code changes.
3. Verify dimensions are square or near-square — current usage renders at
   28×28 (nav) and 40×40 (footer), so anything in the 256–1024 px range
   exported as a webp will work.

**Halt condition triggered:** the correct logo asset is not present in this
repo and I don't have access to the chop-it-app repo from this environment.
Per the brief, this becomes an Isla-creative / cross-repo ask before the
code-side swap can complete. Once the file is provided, the swap is one
file replacement.

---

## 3. Spec drift summary

Quick read of what the marketing-site spec describes vs. what's actually in
the codebase. **Informational only — no fixes proposed here.**

| Item | Spec | Codebase | Notes |
|---|---|---|---|
| Homepage hero image + copy | ✅ | ✅ | `app/components/Hero.tsx` — copy is "Weekly shop, sorted in minutes." with the PhoneMock to the right. The "image" is the `PhoneMock` component, not a photographic hero. If the spec calls for a real photographic hero, that's drift. |
| Weekly Diversity Score explainer | ✅ at `/diversity-score` (per spec) | Partial | `ScoreExplainer` component exists (`app/components/ScoreExplainer.tsx`), wired into the home page as an in-page anchor (`<div id="score">` in `Home.tsx:62-68`). **No dedicated `/diversity-score` route.** Anchor link only. |
| `/blog` route | ✅ | ❌ | Does not exist. Would 404. No `app/blog/` directory. |
| `/recipes/[slug]` detail pages | ✅ | ❌ | Does not exist. Recipe cards in `FeaturedRecipes.tsx:66` link to `href="#"` — placeholder anchor. There is no recipe detail route, no slug field is being read (the `recipes_published` table has no `slug` column either, per the schema dump). |
| `/sitemap.xml` | ✅, dynamically generated | Partial | `app/sitemap.ts` exists and emits exactly three URLs: `/`, `/privacy`, `/terms`. **Recipes are not included** — there's no enumeration of recipe slugs (consistent with the lack of `/recipes/[slug]`). |
| `/robots.txt` | ✅ | ✅ | `app/robots.ts` allows `*` and points at the sitemap. |
| OG / Twitter / metadata | ✅ via `next-seo` (per spec) | Partial | Uses Next.js native metadata API (`app/layout.tsx:22-42`), not `next-seo`. Has `title`, `description`, `openGraph`, `twitter`. **No `og:image` URL set** (the OG card will fall back to whatever Twitter/Facebook pick; likely no preview image). **No JSON-LD structured data** anywhere. **No per-page metadata** beyond root. |
| `/privacy` | ✅ | ✅ | `app/privacy/page.tsx` exists. |
| `/terms` | ✅ | ✅ | `app/terms/page.tsx` exists. |
| Tweaks panel / edit-mode protocol | (internal) | ✅ | `Home.tsx:39-53` and `Tweaks.tsx` — postMessage protocol wired for Claude Design's edit overlay. Not a spec item per se but worth noting it's there. |
| Footer social links | ✅ real URLs | Partial | `Footer.tsx:41-43` — TikTok / Instagram / X all `href="#"`. Placeholders. |
| App Store / Play Store buttons | (out of scope per brief) | n/a | The "Get the app" / "Try the web app" CTAs all `href="#"`, which matches the brief's "post-Apple-account-resolution" note. |
| Collection pages | (Wave 1.5+) | ❌ | None. As expected per scope note. |

Summary: the homepage exists and is largely complete content-wise; the
**routing and SEO surface is the main drift**. No `/blog`, no
`/recipes/[slug]`, no recipe entries in `sitemap.xml`, no `og:image`, no
JSON-LD, no per-page metadata. Most of these are flagged in the brief as
Wave 1.5+ work, so this section is purely a snapshot of what's parked.

---

## Open questions / asks

1. **Vercel env vars** — please confirm `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in the chop-it-marketing Vercel
   project's Production env vars, and that the values match
   `https://elirehiikubpbfyjzwky.supabase.co` + a current anon key. This is
   the most likely cause of the placeholder fallback.
2. **Logo asset** — the correct cleaver logo needs to be provided
   (sourced from chop-it-app, or re-exported by Isla). Once supplied, the
   swap is one file replacement at `public/logo.webp` (and optionally
   `public/logo.png`).
3. **Season filter on featured recipes** — the query restricts to
   `season = 'summer'`. Confirm that's the intended editorial filter for
   the marketing homepage in April/May, or whether it should be season-aware
   (e.g., based on current month) or unfiltered.
4. **Optional debuggability fixes** — should I apply the small logging
   change in `FeaturedRecipes.tsx` so the next failure surfaces error
   details in Vercel logs? (Section 2.1, last paragraph.) Independent of
   the env-var fix.
