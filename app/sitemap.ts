import type { MetadataRoute } from 'next';

import {
  getDistinctCuisines,
  getDistinctSeasons,
  getDistinctTags,
  getPublishedRecipeSlugs,
} from './lib/recipes';
import { SITE_ORIGIN } from './lib/recipeSchema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [slugs, cuisines, seasons, tags] = await Promise.all([
    getPublishedRecipeSlugs(),
    getDistinctCuisines(),
    getDistinctSeasons(),
    getDistinctTags(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_ORIGIN}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_ORIGIN}/recipes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  for (const { slug, updated_at } of slugs) {
    entries.push({
      url: `${SITE_ORIGIN}/recipes/${slug}`,
      lastModified: updated_at ? new Date(updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  for (const cuisine of cuisines) {
    entries.push({
      url: `${SITE_ORIGIN}/recipes/cuisine/${encodeURIComponent(cuisine)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    });
  }
  for (const season of seasons) {
    entries.push({
      url: `${SITE_ORIGIN}/recipes/season/${encodeURIComponent(season)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    });
  }
  for (const tag of tags) {
    entries.push({
      url: `${SITE_ORIGIN}/recipes/tag/${encodeURIComponent(tag)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    });
  }

  for (const path of ['/privacy', '/terms', '/data-deletion'] as const) {
    entries.push({
      url: `${SITE_ORIGIN}${path}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    });
  }

  return entries;
}
