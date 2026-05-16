'use client';

// Pre-launch waitlist signup form. Renders the email input + submit
// button inline on desktop, stacked on mobile. Used in two surfaces:
//
//   <WaitlistForm location="hero" />          — homepage hero
//   <WaitlistForm location="footer_sticky" /> — sticky bottom bar after scroll
//
// State machine: idle → submitting → success | error. On success the form
// is replaced in-place with a confirmation block; no layout shift.
//
// Cloudflare Turnstile is rendered invisibly via the <Script> tag injected
// once at mount when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. If the env var
// is absent (pre-provisioning), the widget is skipped and the submit
// proceeds without a token — the Edge Function's TURNSTILE_SECRET is also
// env-gated, so the two halves stay consistent.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import posthog from 'posthog-js';

import {
  setWaitlistMemberPersonProperties,
  trackWaitlistSubmitAttempted,
  trackWaitlistSubmitFailed,
  trackWaitlistSubmitSucceeded,
} from '@/lib/posthog-events';
import {
  COUNTER_CACHE_KEY,
  readUtmParams,
  WAITLIST_EMAIL_RE,
  WAITLIST_SUBMIT_URL,
  type WaitlistLocation,
  type WaitlistSubmitPayload,
  type WaitlistSubmitResponse,
} from '@/lib/waitlist';

type WaitlistFormProps = {
  location: WaitlistLocation;
  // Optional callback fired on successful submission. Sticky bar uses
  // this to slide-collapse and remember dismissal.
  onSuccess?: (alreadySubscribed: boolean) => void;
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Augment the window typing for the Turnstile global the script attaches.
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          size?: 'normal' | 'compact' | 'invisible' | 'flexible';
          appearance?: 'always' | 'execute' | 'interaction-only';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

// Module-level flag so we only inject the Turnstile script once across
// all mounted forms.
let turnstileScriptInjected = false;

function injectTurnstileScript(): void {
  if (turnstileScriptInjected) return;
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src*="turnstile/v0/api.js"]`)) {
    turnstileScriptInjected = true;
    return;
  }
  const s = document.createElement('script');
  s.src = TURNSTILE_SRC;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
  turnstileScriptInjected = true;
}

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; alreadySubscribed: boolean }
  | { status: 'error'; message: string };

export default function WaitlistForm({ location, onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>({ status: 'idle' });
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const emailId = useId();
  const errorId = `${emailId}-error`;

  // Resolve the Turnstile token. Returns null if not available — caller
  // decides whether to abort.
  const getTurnstileToken = useCallback((): string | undefined => {
    if (!TURNSTILE_SITE_KEY || typeof window === 'undefined' || !window.turnstile) {
      return undefined;
    }
    if (turnstileWidgetId.current) {
      const t = window.turnstile.getResponse(turnstileWidgetId.current);
      return t || undefined;
    }
    return undefined;
  }, []);

  // Render the invisible Turnstile widget once on mount, if the site key
  // is configured. The actual token is only fetched on submit.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    injectTurnstileScript();
    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      const container = turnstileContainerRef.current;
      if (!container) return;
      if (!window.turnstile) {
        // Script not loaded yet — poll for ~10s.
        setTimeout(tryRender, 250);
        return;
      }
      if (turnstileWidgetId.current) return;
      try {
        turnstileWidgetId.current = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          size: 'invisible',
        });
      } catch (err) {
        // Turnstile can throw if the site key is wrong or the widget is
        // already rendered. Log and degrade — submission still works
        // (the server will reject if it expects a token).
        // eslint-disable-next-line no-console
        console.warn('[WaitlistForm] turnstile render failed', err);
      }
    };
    tryRender();
    return () => {
      cancelled = true;
      const id = turnstileWidgetId.current;
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          /* ignore */
        }
        turnstileWidgetId.current = null;
      }
    };
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (state.status === 'submitting') return;

      const trimmed = email.trim();
      trackWaitlistSubmitAttempted({ location, has_email: trimmed.length > 0 });

      if (!WAITLIST_EMAIL_RE.test(trimmed)) {
        setState({ status: 'error', message: 'Please enter a valid email.' });
        trackWaitlistSubmitFailed({ location, error_type: 'invalid_email' });
        return;
      }

      setState({ status: 'submitting' });

      // Trigger Turnstile execution if configured — invisible widgets
      // require execute() to actually fetch a token.
      if (TURNSTILE_SITE_KEY && window.turnstile && turnstileWidgetId.current) {
        try {
          window.turnstile.execute(turnstileWidgetId.current);
        } catch {
          /* ignore */
        }
      }

      // Wait a tick + poll briefly for the token. Invisible Turnstile
      // resolves synchronously in the happy case, so 500ms total is
      // generous.
      let turnstileToken: string | undefined;
      if (TURNSTILE_SITE_KEY) {
        for (let i = 0; i < 10; i++) {
          turnstileToken = getTurnstileToken();
          if (turnstileToken) break;
          await new Promise((r) => setTimeout(r, 50));
        }
      }

      const distinctId =
        typeof posthog.get_distinct_id === 'function' ? posthog.get_distinct_id() : undefined;

      const payload: WaitlistSubmitPayload = {
        email: trimmed,
        turnstile_token: turnstileToken,
        posthog_distinct_id: distinctId,
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        landing_path:
          typeof window !== 'undefined' ? window.location.pathname : undefined,
        ...readUtmParams(),
      };

      let res: Response;
      try {
        res = await fetch(WAITLIST_SUBMIT_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[WaitlistForm] network error', err);
        setState({
          status: 'error',
          message: 'Something went wrong. Please try again.',
        });
        trackWaitlistSubmitFailed({ location, error_type: 'network_error' });
        return;
      }

      let body: WaitlistSubmitResponse;
      try {
        body = (await res.json()) as WaitlistSubmitResponse;
      } catch {
        setState({
          status: 'error',
          message: 'Something went wrong. Please try again.',
        });
        trackWaitlistSubmitFailed({ location, error_type: 'unknown' });
        return;
      }

      if (res.status === 400) {
        const msg =
          body.error === 'turnstile_failed'
            ? 'Verification failed. Please refresh and try again.'
            : 'Please enter a valid email.';
        setState({ status: 'error', message: msg });
        trackWaitlistSubmitFailed({
          location,
          error_type:
            body.error === 'turnstile_failed' ? 'turnstile_failed' : 'invalid_email',
        });
        return;
      }

      if (!res.ok || !body.ok) {
        setState({
          status: 'error',
          message: 'Something went wrong. Please try again.',
        });
        trackWaitlistSubmitFailed({ location, error_type: 'submission_failed' });
        return;
      }

      const alreadySubscribed = Boolean(body.already_subscribed);
      setState({ status: 'success', alreadySubscribed });
      trackWaitlistSubmitSucceeded({ location, already_subscribed: alreadySubscribed });
      setWaitlistMemberPersonProperties();
      // Invalidate the cached counter so the next render of <WaitlistCounter>
      // refetches — they'll see their own +1.
      try {
        sessionStorage.removeItem(COUNTER_CACHE_KEY);
      } catch {
        /* ignore */
      }
      onSuccess?.(alreadySubscribed);
    },
    [email, getTurnstileToken, location, onSuccess, state.status],
  );

  const isSubmitting = state.status === 'submitting';
  const errorMessage = state.status === 'error' ? state.message : null;
  const surfaceClass = useMemo(
    () => `waitlist-form waitlist-form-${location.replace('_', '-')}`,
    [location],
  );

  if (state.status === 'success') {
    return (
      <div className={`${surfaceClass} waitlist-success`} role="status" aria-live="polite">
        <p className="waitlist-success-h">You&rsquo;re in.</p>
        <p className="waitlist-success-sub">
          {state.alreadySubscribed
            ? 'You were already on the list.'
            : 'Check your inbox for a confirmation.'}
        </p>
      </div>
    );
  }

  return (
    <form className={surfaceClass} onSubmit={submit} noValidate>
      <label htmlFor={emailId} className="waitlist-label">
        Join the waitlist
      </label>
      <div className="waitlist-row">
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          aria-invalid={errorMessage ? 'true' : 'false'}
          aria-describedby={errorMessage ? errorId : undefined}
          className="waitlist-input"
        />
        <button
          type="submit"
          className="btn btn-primary waitlist-submit"
          disabled={isSubmitting || email.trim().length === 0}
        >
          {isSubmitting ? 'Joining…' : 'Join'}
        </button>
      </div>
      {errorMessage && (
        <p id={errorId} className="waitlist-error" role="alert">
          {errorMessage}
        </p>
      )}
      {/* Invisible Turnstile widget — only rendered when configured. */}
      {TURNSTILE_SITE_KEY && (
        <div ref={turnstileContainerRef} className="waitlist-turnstile" aria-hidden="true" />
      )}
    </form>
  );
}
