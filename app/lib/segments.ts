// Primary-segment picker for /recipes/[slug] in-page navigation.
//
// A recipe in `recipes_published.tags_json._catalog.segments[]` can carry
// multiple catalog segments (the offline curation pass tags one recipe
// against several "Quick weeknight + Healthy + Tray bake" buckets).
// For the breadcrumb middle crumb and the "More from <segment>" footer
// section we want a *single* primary segment per recipe, picked by the
// priority order below. Curation rationale: bbq_szn is seasonal and the
// most marketable surface; quick/comfort/healthy are the strongest
// editorial tentpoles; the rest of the list trails into long-tail.
//
// Returns null when the recipe carries no segments at all (very rare —
// at the time of writing 0 of 1,024 published recipes lacked segments),
// OR when it only carries segments outside the priority list (also
// expected to be zero in practice — every catalog segment is listed
// here).

import { COLLECTION_META } from './collections';

export const SEGMENT_PRIORITY = [
  'bbq_szn',
  'quick',
  'comfort',
  'healthy',
  'high_protein',
  'one_pot',
  'batch',
  'tray_bake',
  'kid_friendly',
  'fodmap',
  'puds',
] as const;

export type SegmentSlug = (typeof SEGMENT_PRIORITY)[number];

// tags_json shape isn't strict-typed on the Recipe row (jsonb), so we
// take the loosest type we can read safely.
type TagsWithCatalog =
  | { _catalog?: { segments?: unknown } | null; [k: string]: unknown }
  | null
  | undefined;

export function getRecipeSegments(tagsJson: TagsWithCatalog): string[] {
  const raw = tagsJson?._catalog?.segments;
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === 'string');
}

export function pickPrimarySegment(tagsJson: TagsWithCatalog): SegmentSlug | null {
  const segments = getRecipeSegments(tagsJson);
  if (segments.length === 0) return null;
  for (const s of SEGMENT_PRIORITY) {
    if (segments.includes(s)) return s as SegmentSlug;
  }
  return null;
}

export function segmentTitle(slug: SegmentSlug): string {
  return COLLECTION_META[slug]?.name ?? slug;
}
