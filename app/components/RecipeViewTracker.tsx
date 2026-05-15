'use client';

// Render at the top of /recipes/[slug]/page.tsx. Fires exactly one
// recipe_view event on mount (useRef dedupe stops StrictMode double-fire
// in React dev). Pulls referrer from document.referrer, fallback 'direct'.

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

export default function RecipeViewTracker(props: RecipeViewTrackerProps) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackRecipeView({
      ...props,
      referrer:
        typeof document !== 'undefined' && document.referrer ? document.referrer : 'direct',
    });
    // Single-shot. New slug = new component instance = new mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
