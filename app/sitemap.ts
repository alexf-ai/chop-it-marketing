import type { MetadataRoute } from 'next';

import { getAllRecipeIds } from './lib/recipes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const ids = await getAllRecipeIds();

  return [
    {
      url: 'https://chop-it.com',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...ids.map((id) => ({
      url: `https://chop-it.com/recipes/${id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    {
      url: 'https://chop-it.com/privacy',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://chop-it.com/terms',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
