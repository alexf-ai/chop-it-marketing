// Shared waitlist constants used by both <WaitlistForm> and
// <WaitlistStickyBar>.
//
// Email regex must match the Edge Function's regex byte-for-byte — if
// they drift, the frontend will let through addresses the server rejects
// (or vice versa). Same regex also lives in the SQL CHECK constraint on
// public.marketing_waitlist.

export const WAITLIST_EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const WAITLIST_SUBMIT_URL =
  'https://elirehiikubpbfyjzwky.supabase.co/functions/v1/waitlist-submit';

export const WAITLIST_COUNT_URL =
  'https://elirehiikubpbfyjzwky.supabase.co/rest/v1/marketing_waitlist_count?select=total';

// Don't show the social-proof counter until the number is big enough to
// actually be social proof. Below this, render nothing.
export const COUNTER_MIN_DISPLAY = 200;

// SessionStorage key the sticky bar uses to remember it's been dismissed.
export const STICKY_DISMISSED_KEY = 'waitlist_sticky_dismissed';

// SessionStorage key the counter uses to cache the fetched total. Stored
// as `{ total: number, fetched_at: number }` JSON.
export const COUNTER_CACHE_KEY = 'waitlist_count_cache';
export const COUNTER_CACHE_MS = 5 * 60 * 1000; // 5 minutes

export type WaitlistLocation = 'hero' | 'footer_sticky';

export type WaitlistSubmitPayload = {
  email: string;
  turnstile_token?: string;
  posthog_distinct_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_path?: string;
};

export type WaitlistSubmitResponse = {
  ok: boolean;
  already_subscribed?: boolean;
  error?: string;
};

/**
 * Read UTM params from window.location.search. Returns only the keys that
 * are present, so the caller can spread them into the payload without
 * over-writing prior values.
 */
export function readUtmParams(): Pick<
  WaitlistSubmitPayload,
  'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content'
> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  const out: WaitlistSubmitPayload = { email: '' };
  for (const key of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ] as const) {
    const v = sp.get(key);
    if (v) out[key] = v;
  }
  const { email: _drop, ...rest } = out;
  void _drop;
  return rest;
}
