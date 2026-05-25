import Image from 'next/image';
import Link from 'next/link';

import DishPlaceholder from './DishPlaceholder';
import Reveal from './motion/Reveal';
import StaggerGroup from './motion/StaggerGroup';
import StaggerItem from './motion/StaggerItem';
import { supabase, supabaseConfigured } from '@/app/lib/supabase';

export const revalidate = 3600;

type Placeholder = {
  name: string;
  time: string;
  tone: 'warm' | 'herb' | 'berry' | 'amber' | 'smoke';
  tags: string[];
};

const PLACEHOLDERS: Placeholder[] = [
  { name: 'Harissa butter beans, whipped feta, crispy shallots', time: '25 min', tone: 'amber', tags: ['Veg', 'Quick'] },
  { name: 'Miso-glazed aubergine, sesame greens, jasmine rice', time: '30 min', tone: 'herb', tags: ['Veg'] },
  { name: 'Lemon chicken orzo, charred courgette, dill', time: '28 min', tone: 'warm', tags: ['Family'] },
  { name: 'Smoky black bean tacos, pickled onion slaw', time: '22 min', tone: 'berry', tags: ['Veg', 'Quick'] },
  { name: 'Crispy gnocchi, brown butter sage, walnuts', time: '20 min', tone: 'amber', tags: ['Quick'] },
  { name: 'Cod with lentils, salsa verde, blistered tomatoes', time: '32 min', tone: 'smoke', tags: ['Fish'] },
];

type LiveRecipe = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  season: string | null;
  display_priority: number | null;
};

const FEATURED_TOTAL = 6;
const MAX_VEG_FEATURED = 3;
// Word-boundary match on common meat/fish proteins. Used to balance the
// Featured grid so it doesn't read as veg-only when veg recipes happen to
// outrank protein recipes by display_priority.
const PROTEIN_TITLE_RE =
  /\b(beef|steak|ribeye|brisket|chicken|poultry|pork|bacon|sausage|chorizo|ham|pancetta|prosciutto|lamb|mutton|duck|turkey|salmon|cod|tuna|bass|haddock|sardine|mackerel|trout|fish|prawn|shrimp|scallop|mussel|octopus|squid|crab|lobster)\b/i;

function isProteinTitle(title: string): boolean {
  return PROTEIN_TITLE_RE.test(title);
}

function balanceVegFeatured(recipes: LiveRecipe[]): LiveRecipe[] {
  const protein = recipes.filter((r) => isProteinTitle(r.title));
  const veg = recipes.filter((r) => !isProteinTitle(r.title));
  // If we don't have enough protein options to balance, fall back to the
  // raw priority order rather than show fewer than FEATURED_TOTAL.
  if (protein.length < FEATURED_TOTAL - MAX_VEG_FEATURED) {
    return recipes.slice(0, FEATURED_TOTAL);
  }
  const keepVeg = veg.slice(0, MAX_VEG_FEATURED);
  const keepProtein = protein.slice(0, FEATURED_TOTAL - keepVeg.length);
  const kept = new Set([...keepVeg, ...keepProtein].map((r) => r.id));
  return recipes.filter((r) => kept.has(r.id)).slice(0, FEATURED_TOTAL);
}

async function getFeaturedRecipes(): Promise<LiveRecipe[] | null> {
  if (!supabase || !supabaseConfigured) {
    console.warn(
      '[FeaturedRecipes] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing in this environment — using placeholders',
    );
    return null;
  }

  // Fetch more than we need so we have room to rebalance veg vs protein
  // post-query (the recipes table has no diet/type column to filter on).
  const { data, error } = await supabase
    .from('recipes_published')
    .select('id, slug, title, image_url, season, display_priority')
    .eq('season', 'summer')
    .not('image_url', 'is', null)
    .not('slug', 'is', null)
    .order('display_priority', { ascending: false })
    .limit(12);

  if (error) {
    console.warn('[FeaturedRecipes] query error, falling back to placeholders:', error.message);
    return null;
  }
  if (!data || data.length === 0) {
    console.warn('[FeaturedRecipes] no published summer recipes with images yet — using placeholders');
    return null;
  }
  return balanceVegFeatured(data as LiveRecipe[]);
}

export default async function FeaturedRecipes() {
  const recipes = await getFeaturedRecipes();

  return (
    <section className="section recipes">
      <Reveal>
        <div className="section-head">
          <div className="kicker mono">— FEATURED THIS WEEK</div>
          <h2 className="h-editorial">
            Cook tonight. <span className="muted">Or park it for Thursday.</span>
          </h2>
        </div>
      </Reveal>
      {/* Tighter stagger (0.06) so 6 cards don't drag — the grid lands
          in ~0.36s rather than ~0.48s at the default 0.08 cadence. */}
      <StaggerGroup className="recipes-grid" stagger={0.06}>
        {recipes
          ? recipes.map((r) => (
              <StaggerItem key={r.id}>
                <Link className="recipe-card" href={`/recipes/${r.slug}`}>
                  <div className="recipe-image">
                    {r.image_url ? (
                      <Image
                        src={r.image_url}
                        alt={r.title}
                        width={600}
                        height={750}
                        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      />
                    ) : (
                      <DishPlaceholder label={r.title} tone="warm" aspect="4 / 5" />
                    )}
                  </div>
                  <div className="recipe-meta">
                    <div className="recipe-name">{r.title}</div>
                  </div>
                </Link>
              </StaggerItem>
            ))
          : PLACEHOLDERS.map((r, i) => (
              <StaggerItem key={i}>
                <a className="recipe-card" href="#">
                  <DishPlaceholder label={r.name} tone={r.tone} aspect="4 / 5" />
                  <div className="recipe-meta">
                    <div className="recipe-tags">
                      {r.tags.map((t) => (
                        <span key={t} className="tag mono">
                          {t}
                        </span>
                      ))}
                      <span className="tag-time mono">{r.time}</span>
                    </div>
                    <div className="recipe-name">{r.name}</div>
                  </div>
                </a>
              </StaggerItem>
            ))}
      </StaggerGroup>
    </section>
  );
}
