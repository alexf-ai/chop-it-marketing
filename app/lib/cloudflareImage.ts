// Cloudflare Images delivery-URL builder.
//
// Recipe images live on Cloudflare Images (imagedelivery.net). Most rows
// carry a fully-formed `image_url`, but a meaningful slice — particularly
// user-created recipes shared into a menu — only carry the raw
// `cloudflare_image_id` (or an `image_key` of the form "<id>/<variant>").
// This resolves any of those into a usable delivery URL so the renderer
// never has to special-case the source.
//
// Mirrors the PWA-side fix: resolve the delivery URL at render time from
// cloudflare_image_id rather than relying on a pre-baked image_url that is
// frequently absent (and frequently an empty string, not null).

// The account hash is the public path segment in every imagedelivery.net
// URL the app already emits — not a secret. Overridable via env in case the
// account is ever migrated, but defaulted so the marketing site works with
// zero extra config.
const ACCOUNT_HASH =
  process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH || '67vDR3QPrkqq3a2SIhwzVg';

const DELIVERY_BASE = `https://imagedelivery.net/${ACCOUNT_HASH}`;

// Cloudflare named variant. "full" is the only variant provisioned on the
// account today (1x1/4x3/16x9 are probed-but-403 — see recipeSchema.ts).
const DEFAULT_VARIANT = 'full';

function clean(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Build a delivery URL from a bare Cloudflare image id.
export function cloudflareImageUrl(
  imageId: string,
  variant: string = DEFAULT_VARIANT,
): string {
  return `${DELIVERY_BASE}/${imageId}/${variant}`;
}

export type RecipeImageSource = {
  image_url?: string | null;
  cloudflare_image_id?: string | null;
  // "<id>/<variant>" e.g. "<uuid>/full".
  image_key?: string | null;
};

// Resolve the best available delivery URL for a recipe, preferring a
// pre-baked image_url and falling back to the raw Cloudflare id / key.
// Returns null when nothing usable is present.
export function resolveRecipeImageUrl(source: RecipeImageSource): string | null {
  const url = clean(source.image_url);
  if (url) return url;

  const id = clean(source.cloudflare_image_id);
  if (id) return cloudflareImageUrl(id);

  const key = clean(source.image_key);
  if (key) {
    // A key already carrying a variant ("<id>/full") is appended whole;
    // a bare id gets the default variant.
    return key.includes('/') ? `${DELIVERY_BASE}/${key}` : cloudflareImageUrl(key);
  }

  return null;
}
