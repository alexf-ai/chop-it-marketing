// Editorial collection definitions for /recipes/collection/<slug>.
// Lives outside the page file because Next.js page modules can only
// export the canonical set (default, generateMetadata, generateStaticParams,
// revalidate, …) — any other named export is rejected at build time.
//
// Placeholder intro copy is the v1 stub; Vita rewrites later. Slugs match
// the curated tags_json._catalog.segments[] values produced by the
// offline catalog pass.

export const COLLECTION_META: Record<string, { name: string; intro: string }> = {
  bbq_szn: {
    name: 'BBQ Season',
    intro: 'Charcoal, smoke, and the rest of summer — placeholder copy, awaiting Vita.',
  },
  quick: {
    name: 'Quick Weeknight Dinners',
    intro: '30 minutes or under, no compromise — placeholder copy, awaiting Vita.',
  },
  batch: {
    name: 'Batch & Freezer',
    intro: 'Cook once, eat well all week — placeholder copy, awaiting Vita.',
  },
  comfort: {
    name: 'Comfort Classics',
    intro: 'The food you actually want to eat — placeholder copy, awaiting Vita.',
  },
  puds: {
    name: 'Puds & Desserts',
    intro: 'End the week on a high — placeholder copy, awaiting Vita.',
  },
  tray_bake: {
    name: 'Traybakes',
    intro: 'One tin, minimal washing up — placeholder copy, awaiting Vita.',
  },
  fodmap: {
    name: 'Low-FODMAP',
    intro: 'Gut-friendly without sacrificing flavour — placeholder copy, awaiting Vita.',
  },
  healthy: {
    name: 'Lighter & Brighter',
    intro: 'Good food that still tastes like dinner — placeholder copy, awaiting Vita.',
  },
  high_protein: {
    name: 'High Protein',
    intro: 'Strong meals for stronger weeks — placeholder copy, awaiting Vita.',
  },
  one_pot: {
    name: 'One Pot',
    intro: 'Everything in, nothing to scrub — placeholder copy, awaiting Vita.',
  },
  kid_friendly: {
    name: 'Kid Friendly',
    intro: "Crowd-pleasers that won't bore the adults — placeholder copy, awaiting Vita.",
  },
};

export const COLLECTION_SLUGS = Object.keys(COLLECTION_META);
