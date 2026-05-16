'use client';

// Typed PostHog event helpers for the chop-it.com marketing site.
//
// This module is the single source of truth for event names + property
// shapes. Components import these helpers instead of calling
// posthog.capture inline — keeps the event taxonomy reviewable in one
// place and the call sites editor-discoverable.
//
// PostHog is initialised by instrumentation-client.ts (wizard install).
// Do NOT call posthog.init here.

import posthog from 'posthog-js';

// Where on the site the CTA lives. Add to this union when adding a new
// surface — the literal type forces every call site to be explicit and
// keeps the dashboard groupings clean.
export type CtaLocation = 'nav' | 'mobile_menu' | 'hero' | 'download_cta' | 'recipe_page';

export type NavCtaDestination =
  | 'web_app'
  | 'app_store'
  | 'play_store'
  | 'sign_in'
  | 'get_app'
  | 'see_how_it_works';

export type StoreClickProps = {
  recipe_slug?: string;
  recipe_title?: string;
  location: CtaLocation;
};

export type RecipeViewProps = {
  recipe_id: string;
  recipe_slug: string;
  recipe_title: string;
  cuisine: string | null;
  season: string | null;
  cost_band: string | null;
  has_nutrition: boolean;
  // Referrer enrichment, computed at mount time by RecipeViewTracker:
  //  - referrer: raw document.referrer or 'direct'
  //  - referrer_domain: parsed hostname for funnel grouping ('direct' if none)
  //  - search_engine_referrer: regex match against common search hosts —
  //    a cheap organic-vs-other split that doesn't depend on UTM tagging
  //  - entry_path: window.location.pathname at mount, useful when the recipe
  //    page was deep-linked vs reached via /recipes hub navigation
  referrer: string;
  referrer_domain: string;
  search_engine_referrer: boolean;
  entry_path: string;
};

export type NavCtaProps = {
  destination: NavCtaDestination;
  location: CtaLocation;
};

export function trackAppStoreClick(props: StoreClickProps): void {
  posthog.capture('app_store_click', props);
}

export function trackPlayStoreClick(props: StoreClickProps): void {
  posthog.capture('play_store_click', props);
}

export function trackRecipeView(props: RecipeViewProps): void {
  posthog.capture('recipe_view', props);
}

export function trackNavCtaClick(props: NavCtaProps): void {
  posthog.capture('nav_cta_click', props);
}

// Generic CTA tracking — fires alongside the typed helpers above so the
// dashboard can pivot on a single `cta_clicked` event with a closed
// `cta_location` enum (autocapture misses icon buttons + image links).
//
// Closed enum: extend this union when adding a new surface; ad-hoc string
// values are rejected at compile time so dashboards don't accumulate
// typo'd variants.
export type CtaSurface =
  | 'homepage_hero'
  | 'homepage_secondary'
  | 'header_nav'
  | 'mobile_menu'
  | 'footer'
  | 'recipe_page_inline'
  | 'recipe_page_footer';

export type CtaClickedProps = {
  cta_location: CtaSurface;
  cta_label: string;
  cta_destination: string;
};

export function trackCtaClicked(props: CtaClickedProps): void {
  posthog.capture('cta_clicked', props);
}

// Outbound link tracking — fired automatically by the global click listener
// in instrumentation-client.ts. Exposed here so any imperative call sites
// (e.g. a programmatic window.location assignment) can fire the same event.
export type OutboundDestination = 'app' | 'tiktok' | 'instagram' | 'x' | 'twitter';

export function trackOutboundToApp(props: { from_url: string; to_url: string }): void {
  posthog.capture('outbound_to_app', props);
}

export function trackOutboundToSocial(props: {
  platform: OutboundDestination;
  from_url: string;
  to_url: string;
}): void {
  posthog.capture('outbound_to_social', props);
}

// Waitlist taxonomy — the v1 conversion funnel.
//
// `location` distinguishes the hero form from the sticky footer bar, so
// the dashboard can pivot conversion rate by surface without needing
// extra autocapture.

export type WaitlistLocation = 'hero' | 'footer_sticky';

export type WaitlistAttemptedProps = {
  location: WaitlistLocation;
  has_email: boolean;
};

export type WaitlistSucceededProps = {
  location: WaitlistLocation;
  already_subscribed: boolean;
};

export type WaitlistFailedProps = {
  location: WaitlistLocation;
  error_type:
    | 'invalid_email'
    | 'turnstile_failed'
    | 'network_error'
    | 'submission_failed'
    | 'unknown';
};

export function trackWaitlistSubmitAttempted(props: WaitlistAttemptedProps): void {
  posthog.capture('waitlist_submit_attempted', props);
}

export function trackWaitlistSubmitSucceeded(props: WaitlistSucceededProps): void {
  posthog.capture('waitlist_submit_succeeded', props);
}

export function trackWaitlistSubmitFailed(props: WaitlistFailedProps): void {
  posthog.capture('waitlist_submit_failed', props);
}

export function trackWaitlistStickyShown(): void {
  posthog.capture('waitlist_sticky_shown');
}

export function trackWaitlistStickyDismissed(): void {
  posthog.capture('waitlist_sticky_dismissed');
}

/**
 * Sets the Person profile for an identified waitlist member. Called on
 * successful submission. Combined with the `identified_only` person
 * profile setting in instrumentation-client.ts, this is also what
 * promotes the visitor from anonymous → person in PostHog.
 */
export function setWaitlistMemberPersonProperties(): void {
  posthog.setPersonProperties({
    waitlist_member: true,
    waitlist_joined_at: new Date().toISOString(),
  });
}
