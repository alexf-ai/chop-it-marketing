# Chop It — marketing site

Next.js App Router implementation of the Chop It marketing homepage (chop-it.com).

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
