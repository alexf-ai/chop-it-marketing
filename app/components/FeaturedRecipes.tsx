import Image from 'next/image';

import DishPlaceholder from './DishPlaceholder';
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
  title: string;
  image_url: string | null;
  season: string | null;
  display_priority: number | null;
};

async function getFeaturedRecipes(): Promise<LiveRecipe[] | null> {
  if (!supabase || !supabaseConfigured) {
    console.warn(
      '[FeaturedRecipes] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing in this environment — using placeholders',
    );
    return null;
  }

  const { data, error } = await supabase
    .from('recipes_published')
    .select('id, title, image_url, season, display_priority')
    .eq('season', 'summer')
    .not('image_url', 'is', null)
    .order('display_priority', { ascending: false })
    .limit(6);

  if (error) {
    console.warn('[FeaturedRecipes] query error, falling back to placeholders:', error.message);
    return null;
  }
  if (!data || data.length === 0) {
    console.warn('[FeaturedRecipes] no published summer recipes with images yet — using placeholders');
    return null;
  }
  return data as LiveRecipe[];
}

export default async function FeaturedRecipes() {
  const recipes = await getFeaturedRecipes();

  return (
    <section className="section recipes">
      <div className="section-head">
        <div className="kicker mono">— FEATURED THIS WEEK</div>
        <h2 className="h-editorial">
          Cook tonight. <span className="muted">Or park it for Thursday.</span>
        </h2>
      </div>
      <div className="recipes-grid">
        {recipes
          ? recipes.map((r) => (
              <a key={r.id} className="recipe-card" href="#">
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
              </a>
            ))
          : PLACEHOLDERS.map((r, i) => (
              <a key={i} className="recipe-card" href="#">
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
            ))}
      </div>
    </section>
  );
}
