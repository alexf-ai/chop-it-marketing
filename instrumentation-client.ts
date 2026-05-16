// Client-side PostHog bootstrap. Next.js's instrumentation-client.ts is
// loaded once on first paint; we use it for posthog.init() + a single
// global click listener that:
//
//  1. Rewrites <a href="…chopit.app…"> URLs to append `?phid=<distinct_id>`
//     so the PWA's separate PostHog project can stitch the same user
//     across domains. The PWA needs to call posthog.identify(phid) from
//     the URL on first paint — separate codebase, tracked as a follow-up.
//
//  2. Captures outbound_to_app / outbound_to_social events so we can
//     measure CTR off chop-it.com without depending on the PWA side.
//
// Single capture-phase listener at window means we catch every <a> click,
// including ones in components that mount after the listener installs
// (React Link, components rendered after route change, etc.). Rewriting
// link.href inside the click handler before navigation is safe — browsers
// read the href value AT navigation time, which happens after click
// handlers complete.

import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  // PostHog managed reverse proxy on a chop-it.com subdomain. Cloudflare
  // proxies through to eu.i.posthog.com — no Next.js rewrites needed,
  // and the request stays first-party (ad-blockers don't see a 3rd-party
  // host). Was '/ingest' with Next.js rewrites before this change.
  api_host: 'https://e.chop-it.com',
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-01-30',
  // Only materialise a Person profile when posthog.identify() is called.
  // Cuts MAU billing for anonymous visitors and matches the spec.
  person_profiles: 'identified_only',
  capture_exceptions: true,
  // Domains differ between chop-it.com and chopit.app, so we explicitly
  // disable subdomain-cookie sharing — identity passthrough rides on
  // the ?phid= query param injected at click time instead.
  cross_subdomain_cookie: false,
  debug: process.env.NODE_ENV === 'development',
});

// Social hosts we care about for outbound tracking. Keep the pattern
// brand-anchored so e.g. tiktok.example.com doesn't impersonate TikTok.
type SocialMatch = { test: RegExp; platform: 'tiktok' | 'instagram' | 'x' | 'twitter' };
const SOCIAL_MATCHERS: SocialMatch[] = [
  { test: /^https?:\/\/(www\.)?tiktok\.com\//i, platform: 'tiktok' },
  { test: /^https?:\/\/(www\.)?instagram\.com\//i, platform: 'instagram' },
  { test: /^https?:\/\/(www\.)?x\.com\//i, platform: 'x' },
  { test: /^https?:\/\/(www\.)?twitter\.com\//i, platform: 'twitter' },
];

if (typeof window !== 'undefined') {
  window.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (!target || typeof target.closest !== 'function') return;
      const link = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!link) return;

      // link.href returns the resolved absolute URL — easier to pattern-
      // match than the raw attribute, which may be relative or path-only.
      const href = link.href;
      if (!href) return;

      // 1. chopit.app passthrough — rewrite then capture
      if (/^https?:\/\/(www\.)?chopit\.app\b/i.test(href)) {
        try {
          const distinctId =
            typeof posthog.get_distinct_id === 'function' ? posthog.get_distinct_id() : null;
          if (distinctId) {
            const url = new URL(href);
            url.searchParams.set('phid', distinctId);
            link.href = url.toString();
          }
        } catch {
          // Malformed URL — leave the href alone, still fire the event so
          // we can measure CTR even when rewriting failed.
        }
        try {
          posthog.capture('outbound_to_app', {
            from_url: window.location.pathname,
            to_url: link.href,
          });
        } catch {
          /* ignore — tracking never blocks navigation */
        }
        return;
      }

      // 2. Social outbound — single capture per click
      for (const { test, platform } of SOCIAL_MATCHERS) {
        if (test.test(href)) {
          try {
            posthog.capture('outbound_to_social', {
              platform,
              from_url: window.location.pathname,
              to_url: href,
            });
          } catch {
            /* ignore */
          }
          break;
        }
      }
    },
    // Capture phase: runs before the browser begins navigation, which
    // means our href rewrite is in effect by the time the navigation
    // reads it.
    true,
  );
}
