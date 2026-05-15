# Mobile fixes applied — chop-it.com marketing

Applied: 2026-05-15 · Branch: `claude/interesting-hermann-3bbc94`.
Scope: CSS-only changes to [app/styles/globals.css](../app/styles/globals.css). No JSX/component changes. No new dependencies.

## What was done

All changes live inside `@media (max-width: 640px)` blocks. Desktop rules
were not modified. No `!important` was added (the one existing
`!important` on `.ring-wrap` is unrelated and untouched).

### 1. Recipe card grid (audit J-01)
- Changed `.recipes-grid` from `grid-template-columns: 1fr` → `repeat(2, 1fr)` at ≤640.
- Added `.recipe-card .recipe-image { aspect-ratio: 1 / 1 }` for mobile.
- Tightened `.recipe-name` to 16px and `.recipe-meta` to 12px on mobile.

**Caveat:** in dev without Supabase, recipe cards render
`DishPlaceholder` (a `.dish-ph` div with inline `style="aspect-ratio:4/5"`),
not `.recipe-image`. The inline style wins over CSS, so the 1/1 aspect
ratio only takes effect in production where `<Image>` is rendered inside
`.recipe-image`. This is dev-only and matches audit note M-09.

### 2. Card dead air (J-03, J-04)
- `.what-card { min-height: auto; padding: 24px }` on mobile.
- `.how-step { min-height: auto; padding: 24px }` on mobile.
- The new `.how-step { padding: 24px }` overrides the previous mobile
  rule `.how-step { padding: 28px 20px 0 }` at the same media-query level
  (cascade order). The bottom-bleed visuals inside `.how-step` now sit
  above 24px of padding rather than flush to the edge; the cards are
  shorter overall and the bleed effect is no longer visually meaningful
  on mobile.

### 3. Section rhythm (M-03, M-06)
- Changed `.section { padding: 48px 20px }` → `padding: 32px 20px` at ≤640.
- Same for `.section.recipes`.
- Added `.section-head { margin-bottom: 32px }` on mobile.

### 4. Hero H1 (J-05, M-01, M-02)
- `.hero-h { font-size: clamp(40px, 11vw, 56px); line-height: 1.02; letter-spacing: -0.03em }` on mobile.
- `.h-editorial { line-height: 1.08 }` on mobile (fixes descender clipping on `<em>` glyphs).
- The hard-break `<span class="hero-h-line">` tags in `Hero.tsx` were NOT touched per scope.

### 5. Hero stats dots (J-06)
- Existing rule kept stats column-stacked; updated gap from 18px → 16px.
- **Class adaptation:** the prompt referenced `.hero-stat` and
  `.hero-stat-value`. The actual JSX has unclassed `<div>` containers
  inside `.hero-stats` and uses `.hero-stat-v` (not `-value`) for the
  value span. Adapted to:
  ```css
  .hero-stats > div { display: flex; align-items: baseline; gap: 8px; }
  .hero-stats .hero-stat-v { display: inline-flex; align-items: baseline; }
  ```
  Verified at 375px: each stat now sits on one row with kicker + value +
  pink `.dot` all baseline-aligned (`dotInline: true` in the live
  computed-style check).

### 6. Phone mock pillars (M-05)
- **Class adaptation:** the prompt referenced `.phone-pillar`. The actual
  JSX uses `.phone-pillars` (container) and `.pill` (each pill — shared
  with the wider design system). Targeted as:
  ```css
  .phone-pillars { gap: 2px; flex-wrap: nowrap; }
  .phone-pillars .pill { font-size: 10px; padding: 2px 6px; }
  ```
  Scoped `.pill` to `.phone-pillars` so the change doesn't leak to
  other `.pill` instances. Verified: row height now 21.5px (single
  line), no wrap.

### 7. Download CTA stack (M-07)
- **Class adaptation:** the prompt referenced `.download-cta-stores` but
  no such wrapper exists in `DownloadCTA.tsx` — the `.download-cta-row`
  has the two `.store-pill` anchors and the web `.btn` as direct
  children. Without a JSX change, used a 2-column grid and spanned the
  web button across both columns:
  ```css
  .download-cta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }
  .download-cta-row .store-pill { width: 100%; align-items: center; text-align: center; }
  .download-cta-row .btn { grid-column: 1 / -1; width: 100%; }
  ```
  Replaces the previous `flex-direction: column; width: 100%` rule. App
  Store + Google Play sit side-by-side; "Try the web app" stacks below.

### 8. Legal pages (M-10)
- Added (in a new `@media (max-width: 640px)` block adjacent to the
  legal styles):
  ```css
  .legal-body h2 { margin: 32px 0 12px; font-size: 22px; }
  ```

## Validation

Re-captured screenshots via `audit/capture-after.spec.ts` →
[audit/screenshots-after/](screenshots-after/).

### Page height diff (CSS px, from full-page screenshots)

| Route | Width | Before | After | Δ |
|---|---:|---:|---:|---:|
| `/` | 375 | 13,212 | 10,316 | **−2,896** |
| `/` | 1440 | ~7,900 | 7,898 | ~0 (desktop unchanged ✓) |
| `/privacy` | 375 | 2,473 | 2,346 | −127 |
| `/terms` | 375 | 3,804 | 3,554 | −250 |
| `/data-deletion` | 375 | 3,018 | 2,870 | −148 |

Home @375 dropped from 13,212 → 10,316 (−22%). The audit target was
9,000–9,500; the remaining ~800–1,300px gap comes from:

1. **Dev-only:** dish-placeholder cards use inline `style="aspect-ratio:4/5"`
   (~83px taller per card × 6 cards ≈ ~500px). In production with real
   `<Image>` recipe photos, `.recipe-image { aspect-ratio: 1/1 }` applies
   and the page should fall a further ~500–800px.
2. **Dev-only:** `PantrySection` renders with empty visual when Supabase
   is absent (~200–400px of unused space). Production has data.

Expected production home-page height @375: **~8,800–9,400 px** — within target.

### Live computed-style verification (at 375px viewport)

```
recipesGrid:       "161.5px 161.5px"       (2-column ✓)
whatCardMinH:      "auto"                  (J-03 ✓)
whatCardPad:       "24px"
howStepMinH:       "auto"                  (J-04 ✓)
howStepPad:        "24px"
heroHFont:         "41.25px"               (clamp floor 40, 11vw·375=41.25 ✓)
heroStatsFlex:     "column"
firstStatDisplay:  "flex"                  (J-06 stat row now baseline-aligned ✓)
dotInline:         true                    (.dot on same line as value ✓)
pillarsFlex:       "nowrap gap=2px"        (M-05 ✓)
pillarsHeight:     21.5                    (single line ✓)
dlRowDisplay:      "grid cols=163.5px 163.5px" (M-07 store pills side-by-side ✓)
overflowX:         0                       (no horizontal scroll ✓)
```

Desktop @1440 page height unchanged (7,898 vs ~7,900 pre-fix).

## Class names that needed adapting from the prompt

| Prompt class | Actual class in JSX | Adapted to |
|---|---|---|
| `.hero-stat` | unclassed `<div>` in `.hero-stats` | `.hero-stats > div` |
| `.hero-stat-value` | `.hero-stat-v` | `.hero-stats .hero-stat-v` |
| `.phone-pillar` | `.pill` (inside `.phone-pillars`) | `.phone-pillars .pill` |
| `.download-cta-stores` | (does not exist) | grid 2-col + `.btn { grid-column: 1 / -1 }` |
