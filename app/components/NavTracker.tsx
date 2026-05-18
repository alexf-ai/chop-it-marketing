'use client';

// Tracks in-app navigation so <BackLink> can tell whether router.back()
// will send the visitor back to a page on chop-it.com or off-site.
//
// document.referrer is unreliable for this — Next.js soft-navigations
// don't update it, so a visitor who landed on / from Google and then
// clicked into a recipe would still have referrer = "google.com" at
// the recipe page, and a referrer-based check would wrongly fall
// through to the bare anchor target.
//
// Approach: bump a sessionStorage counter on every pathname change.
// >1 means there's at least one earlier in-app entry to pop back to.
// sessionStorage is per-tab so a new tab (cmd-click, share link)
// starts fresh and the counter sits at 1 = "this is the first in-app
// page" = use the anchor fallback.

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const NAV_COUNT_KEY = 'chopit-nav-count';

export default function NavTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const current = Number.parseInt(window.sessionStorage.getItem(NAV_COUNT_KEY) ?? '0', 10);
      const next = Number.isFinite(current) && current >= 0 ? current + 1 : 1;
      window.sessionStorage.setItem(NAV_COUNT_KEY, String(next));
    } catch {
      // sessionStorage can throw in private-mode quotas / sandboxed
      // iframes — the back link gracefully falls back to /recipes
      // navigation if so, which is the safe default.
    }
  }, [pathname]);

  return null;
}
