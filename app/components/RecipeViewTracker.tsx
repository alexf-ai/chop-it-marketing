'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function RecipeViewTracker({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  useEffect(() => {
    posthog.capture('recipe_viewed', { recipe_slug: slug, recipe_title: title });
  }, [slug, title]);

  return null;
}
