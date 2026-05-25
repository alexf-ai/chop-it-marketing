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
  // Global security headers. CSP is deliberately NOT set here yet — it needs
  // a Report-Only rollout + dedicated testing (PostHog at e.chop-it.com,
  // Turnstile at challenges.cloudflare.com, Supabase, imagedelivery.net, plus
  // the inline ld+json scripts) and is tracked as separate work.
  //
  // X-Frame-Options is SAMEORIGIN (not DENY): the Tweaks edit-mode embeds the
  // site in an iframe via postMessage, but only on preview/local builds, never
  // production — so SAMEORIGIN protects against third-party clickjacking
  // without breaking the design tool. If the tool ever embeds production from
  // a different origin, swap this for a CSP `frame-ancestors` directive.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
