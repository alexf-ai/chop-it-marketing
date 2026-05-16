/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'imagedelivery.net' },
      { protocol: 'https', hostname: 'elirehiikubpbfyjzwky.supabase.co' },
    ],
  },
  // PostHog ingest used to route through Next.js rewrites at /ingest/*;
  // those are now handled by the managed reverse proxy at e.chop-it.com
  // (see instrumentation-client.ts api_host). The rewrites are gone.
  // Host normalization: www.chop-it.com → chop-it.com (apex).
  // 308 (permanent) so search engines collapse the two hostnames into one
  // and PostHog stops splitting sessions across them. Path is preserved.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.chop-it.com' }],
        destination: 'https://chop-it.com/:path*',
        permanent: true,
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
