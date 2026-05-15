'use client';

// GDPR cookie/analytics banner.
//
// Rendered in app/layout.tsx after children. Shows ONCE — on first visit
// with no stored choice. On accept, no further opt-in is required (PostHog
// is already capturing by default per its init in instrumentation-client.ts).
// On decline, calls posthog.opt_out_capturing() which prevents any further
// events from leaving the device + sets a localStorage cookie of its own
// so the choice survives reloads.
//
// Two state surfaces survive across visits:
//   - localStorage 'chopit_cookie_choice' = 'accepted' | 'declined'
//   - posthog's own opt-out store (so even if we lose our flag, posthog
//     remembers and doesn't send events).

import Link from 'next/link';
import { useEffect, useState } from 'react';

import posthog from 'posthog-js';

const STORAGE_KEY = 'chopit_cookie_choice';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  // Read the stored choice on mount. We never render on the server (returns
  // null until after mount) so SSR HTML doesn't flash a banner that may not
  // actually be needed.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage can throw in privacy-mode browsers. If we can't read,
      // err on the side of showing the banner — user can still dismiss it.
      stored = null;
    }
    if (stored === 'declined') {
      // Defensive: re-apply the opt-out in case the user opened the page in
      // a fresh tab where posthog has lost its own state.
      try {
        posthog.opt_out_capturing();
      } catch {
        // posthog may not be initialised in some build modes; ignore.
      }
      return;
    }
    if (stored === 'accepted') return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* ignore quota / privacy-mode errors */
    }
    setVisible(false);
  };

  const decline = () => {
    try {
      posthog.opt_out_capturing();
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p className="cookie-banner-copy">
        Chop it uses cookies and analytics to understand how the site is used. See our{' '}
        <Link href="/privacy" className="cookie-banner-link">
          privacy policy
        </Link>
        .
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="btn btn-primary btn-tiny" onClick={accept}>
          Accept
        </button>
        <button type="button" className="btn btn-ghost btn-tiny" onClick={decline}>
          Decline
        </button>
      </div>
    </div>
  );
}
