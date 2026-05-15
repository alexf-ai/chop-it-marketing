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
