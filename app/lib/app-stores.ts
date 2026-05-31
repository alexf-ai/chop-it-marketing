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

// Custom ChatGPT GPT — opens our "Weekly Food Shop Planner" agent in
// chatgpt.com. Treated as a third install/entry surface alongside the
// native stores. Env-overridable so we can swap to a new GPT id without
// a code change.
export const CHATGPT_URL =
  process.env.NEXT_PUBLIC_CHATGPT_URL ??
  'https://chatgpt.com/g/g-69610d39455c8191b7afbc92fd09baae-weekly-food-shop-planner-chop-it';

export const CHATGPT_LIVE = CHATGPT_URL !== '#';
