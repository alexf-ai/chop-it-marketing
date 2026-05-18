'use client';

// "Smart" back link. Renders as a real <Link href="/recipes"> for bots
// and JS-disabled visitors (SEO + accessibility), but on click hijacks
// the navigation to use router.back() *when* there's history to go back
// to AND that history is same-origin.
//
// Why this matters: someone who came in from /recipes/collection/quick
// expects "← All recipes" to return them to that collection at their
// scroll position, not to dump them on the generic hub. But someone
// landing direct from Google has no in-app history — router.back()
// would shove them off-site (back to the SERP), so we fall through to
// the bare anchor navigation and they land on /recipes.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

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

    // Only use browser history if (a) history has an entry to pop back to,
    // and (b) we came from the same origin. The referrer check stops
    // router.back() from sending direct-from-Google visitors back to Google.
    const hasHistory = window.history.length > 1;
    let sameOrigin = false;
    if (document.referrer) {
      try {
        sameOrigin = new URL(document.referrer).origin === window.location.origin;
      } catch {
        sameOrigin = false;
      }
    }

    if (hasHistory && sameOrigin) {
      e.preventDefault();
      router.back();
    }
    // else: let the anchor navigate to href (the SEO fallback).
  };

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
