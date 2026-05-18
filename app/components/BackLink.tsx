'use client';

// "Smart" back link. Renders as a real <Link href="/recipes"> for bots
// and JS-disabled visitors (SEO + accessibility), but on click hijacks
// the navigation to use router.back() *when* there's at least one
// previous in-app page in this tab's session.
//
// Why this matters: someone who came in from /recipes/collection/quick
// expects "← Back" to return them to that collection at their scroll
// position, not to dump them on the generic hub. But someone landing
// direct from Google has no in-app history — router.back() would
// shove them off-site (back to the SERP), so we fall through to the
// bare anchor navigation and they land on /recipes.
//
// We can't use document.referrer here because Next.js client-side
// soft-navigations don't update it (the referrer stays at whatever
// loaded the original document, often google.com or empty). Instead,
// <NavTracker> in the root layout maintains a sessionStorage counter
// that increments on every pathname change; this component reads it
// at click time. Counter > 1 ⇒ there's a real in-app page to go
// back to.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

import { NAV_COUNT_KEY } from './NavTracker';

type BackLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export default function BackLink({ href, className, children }: BackLinkProps) {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Honour modifier keys / middle-click — those want a new tab, not back().
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (typeof window === 'undefined') return;

    let inAppCount = 0;
    try {
      inAppCount = Number.parseInt(
        window.sessionStorage.getItem(NAV_COUNT_KEY) ?? '0',
        10,
      );
    } catch {
      inAppCount = 0;
    }

    // > 1 means the current recipe page is preceded by at least one
    // earlier in-app entry, so router.back() lands on chop-it.com.
    // == 1 means this was the first in-app page (direct landing, new
    // tab, etc.) — fall through to the href so we don't bounce the
    // visitor off-site or to a stale tab entry.
    if (inAppCount > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
