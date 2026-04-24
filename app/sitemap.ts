import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: 'https://chop-it.com',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
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
