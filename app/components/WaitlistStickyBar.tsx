'use client';

// Slides up from the bottom of the viewport once the hero leaves view.
// Single-session: dismiss → sessionStorage flag → never reappears that
// session. Successful submit collapses the bar with a 2-second "You're in"
// flash then hides for the session.
//
// Mounted in app/layout.tsx after {children} so it sits above page
// content but below modals (z-index ladder defined in globals.css).

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  trackWaitlistStickyDismissed,
  trackWaitlistStickyShown,
} from '@/lib/posthog-events';
import { STICKY_DISMISSED_KEY } from '@/lib/waitlist';

import WaitlistForm from './WaitlistForm';

type Phase = 'hidden' | 'visible' | 'success' | 'dismissed';

const HERO_SELECTOR = '.hero, .hero-grid'; // either the wrapper or the grid; first match wins
const SUCCESS_DURATION_MS = 2000;

export default function WaitlistStickyBar() {
  const [phase, setPhase] = useState<Phase>('hidden');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const shownEventFired = useRef(false);

  // Single-session dismissal flag — read once on mount.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(STICKY_DISMISSED_KEY) === '1';
    } catch {
      /* ignore */
    }
    if (dismissed) {
      setPhase('dismissed');
      return;
    }

    const hero = document.querySelector(HERO_SELECTOR);
    if (!hero) {
      // No hero on this page (legal pages, recipe pages, etc.) — sticky
      // bar isn't relevant. Stay hidden.
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            // Hero is out of view → reveal the bar.
            setPhase((current) => (current === 'hidden' ? 'visible' : current));
          }
        }
      },
      { threshold: 0 },
    );
    observerRef.current.observe(hero);
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  // Fire the "shown" PostHog event exactly once when the bar transitions
  // into the visible state.
  useEffect(() => {
    if (phase === 'visible' && !shownEventFired.current) {
      shownEventFired.current = true;
      trackWaitlistStickyShown();
    }
  }, [phase]);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STICKY_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
    trackWaitlistStickyDismissed();
    setPhase('dismissed');
  }, []);

  const handleSuccess = useCallback(() => {
    setPhase('success');
    try {
      sessionStorage.setItem(STICKY_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
    window.setTimeout(() => setPhase('dismissed'), SUCCESS_DURATION_MS);
  }, []);

  if (phase === 'hidden' || phase === 'dismissed') return null;

  return (
    <div
      className="waitlist-sticky"
      role="region"
      aria-label="Join the Chop it waitlist"
    >
      {phase === 'success' ? (
        <p className="waitlist-sticky-success" aria-live="polite">
          You&rsquo;re in.
        </p>
      ) : (
        <>
          <div className="waitlist-sticky-form">
            <WaitlistForm location="footer_sticky" onSuccess={handleSuccess} />
          </div>
          <button
            type="button"
            className="waitlist-sticky-close"
            onClick={dismiss}
            aria-label="Dismiss waitlist"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
