// Twitter Card image — Next.js requires a separate file for this
// convention even though the asset is identical to the Open Graph image.
// Re-exporting the default + named metadata from opengraph-image keeps
// the two endpoints byte-for-byte in sync.

export { default, size, contentType, alt } from './opengraph-image';
