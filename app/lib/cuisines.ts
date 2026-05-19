// Curated cuisine collection landing pages.
//
// Mirrors app/lib/collections.ts (which carries the editorial-segment
// landings, /recipes/collection/<slug>) — slug-keyed map + ordered slug
// list. Used by the /recipes/cuisine/[slug] page + the sitemap +
// the /recipes hub "Browse by cuisine" section.
//
// The order in CUISINE_SLUGS is recipe-count descending at the time of
// writing (British 255 → Chinese 10). Counts come from the
// search_public_recipes RPC with p_cuisines=[slug] — see the RPC
// implementation in the backend repo for the cuisine → recipe mapping.

export type CuisineMeta = { name: string; intro: string };

export const CUISINE_META: Record<string, CuisineMeta> = {
  british: { name: 'British', intro: 'Roasts, pies, classics — the food we grew up on.' },
  italian: { name: 'Italian', intro: 'Pasta, pizza, plates that don’t try too hard.' },
  mediterranean: { name: 'Mediterranean', intro: 'Olive oil, lemons, sunshine on a plate.' },
  'middle-eastern': {
    name: 'Middle Eastern',
    intro: 'Big flavours, generous spices, food for sharing.',
  },
  mexican: { name: 'Mexican', intro: 'Tacos, salsas, the good stuff.' },
  asian: { name: 'Asian', intro: 'Stir-fries, noodles, big bowls of comfort.' },
  japanese: { name: 'Japanese', intro: 'Clean, precise, deeply satisfying.' },
  american: { name: 'American', intro: 'Diners, BBQs, the food America does best.' },
  french: { name: 'French', intro: 'Bistro classics. Butter, wine, and time.' },
  indian: { name: 'Indian', intro: 'Curries, dals, the spice cabinet at full tilt.' },
  greek: { name: 'Greek', intro: 'Mezze, lamb, lemon and oregano.' },
  thai: { name: 'Thai', intro: 'Sweet, sour, hot, salty — all at once.' },
  spanish: { name: 'Spanish', intro: 'Tapas, paella, food that takes its time.' },
  vietnamese: {
    name: 'Vietnamese',
    intro: 'Fresh herbs, fish sauce, big flavour, light touch.',
  },
  korean: { name: 'Korean', intro: 'Gochujang, kimchi, fire and ferment.' },
  moroccan: { name: 'Moroccan', intro: 'Tagines, preserved lemon, spice and slow heat.' },
  chinese: { name: 'Chinese', intro: 'Wok-fried, steamed, braised — the full kitchen.' },
};

// Order by recipe-count desc so the /recipes hub "Browse by cuisine"
// section surfaces the biggest sections first. Values are the production
// counts returned by search_public_recipes(p_cuisines := ARRAY[slug])
// at PR time — used only for ordering + the optional count badge.
export const CUISINE_COUNTS: Record<string, number> = {
  british: 255,
  italian: 109,
  mediterranean: 70,
  'middle-eastern': 52,
  mexican: 41,
  asian: 38,
  japanese: 35,
  american: 32,
  french: 26,
  indian: 22,
  greek: 18,
  thai: 16,
  spanish: 15,
  vietnamese: 13,
  korean: 12,
  moroccan: 11,
  chinese: 10,
};

export const CUISINE_SLUGS = Object.keys(CUISINE_META) as readonly string[];
