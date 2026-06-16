// Twitter Card image for blog posts — Next.js requires a separate file for
// this convention even though the asset is identical to the Open Graph one.
// Re-exporting from opengraph-image keeps the two endpoints in sync, mirroring
// the site-wide app/twitter-image.tsx pattern.

export {
  default,
  size,
  contentType,
  alt,
  generateStaticParams,
} from './opengraph-image';
