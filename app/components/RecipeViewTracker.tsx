'use client';

// Render at the top of /recipes/[slug]/page.tsx. Fires exactly one
// recipe_view event on mount (useRef dedupe stops StrictMode double-fire
// in React dev). All referrer-derived fields are computed inside the
// effect so document.referrer / window.location read the real values
// (not SSR placeholders).

import { useEffect, useRef } from 'react';

import { trackRecipeView } from '@/lib/posthog-events';

export type RecipeViewTrackerProps = {
  recipe_id: string;
  recipe_slug: string;
  recipe_title: string;
  cuisine: string | null;
  season: string | null;
  cost_band: string | null;
  has_nutrition: boolean;
};

// Matches the host portion of the most common organic search referrers.
// Anchored on `<scheme>://<optional www.><brand>.` so a domain like
// `google.example.com` can't pretend to be Google.
const SEARCH_ENGINE_HOST_RE =
  /^https?:\/\/(www\.)?(google|bing|duckduckgo|yahoo|ecosia|brave)\./i;

function safeReferrerDomain(referrer: string): string {
  if (!referrer || referrer === 'direct') return 'direct';
  try {
    return new URL(referrer).hostname;
  } catch {
    return 'direct';
  }
}

export default function RecipeViewTracker(props: RecipeViewTrackerProps) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const referrer = document.referrer || 'direct';
    trackRecipeView({
      ...props,
      referrer,
      referrer_domain: safeReferrerDomain(referrer),
      search_engine_referrer: SEARCH_ENGINE_HOST_RE.test(referrer),
      entry_path: window.location.pathname,
    });
    // Single-shot. New slug = new component instance = new mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
