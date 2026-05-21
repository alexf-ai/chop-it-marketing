// Single source of truth for the App Store + Play Store URLs and live flags.
//
// Used by:
//   - app/components/DownloadCTA.tsx  (homepage block 08)
//   - app/components/RecipeCTA.tsx    (foot of every /recipes/[slug])
//
// iOS launch (gb): https://apps.apple.com/gb/app/chop-it/id6762079343
// Android: not live yet — gated by NEXT_PUBLIC_ANDROID_LIVE === 'true'.
//
// URLs are env-var-overridable so we can swap the regional store ID later
// (e.g. ?l=es to point at the Spanish listing) without a code change.

export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ?? 'https://apps.apple.com/gb/app/chop-it/id6762079343';

export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '#';

// IOS_LIVE is true whenever APP_STORE_URL isn't the placeholder '#'. This
// way the moment we yank the URL (or unset the env var) the eyebrow reverts
// to "COMING SOON" rather than dangling a dead Apple link.
export const IOS_LIVE = APP_STORE_URL !== '#';

export const ANDROID_LIVE = process.env.NEXT_PUBLIC_ANDROID_LIVE === 'true';
