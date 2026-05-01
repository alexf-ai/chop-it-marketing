import Image from 'next/image';
import Link from 'next/link';

import DishPlaceholder from './DishPlaceholder';
import { supabase, supabaseConfigured } from '@/app/lib/supabase';

export const revalidate = 3600;

type LiveRecipe = {
  id: string;
  title: string;
  image_url: string | null;
};

const FALLBACKS: { label: string; tone: 'warm' | 'herb' | 'berry' | 'amber' | 'smoke' }[] = [
  { label: 'Harissa butter beans', tone: 'amber' },
  { label: 'Miso aubergine', tone: 'herb' },
  { label: 'Cod & lentils', tone: 'smoke' },
  { label: 'Lemon orzo', tone: 'warm' },
  { label: 'Black bean tacos', tone: 'berry' },
  { label: 'Crispy gnocchi', tone: 'amber' },
  { label: 'Charred greens', tone: 'herb' },
  { label: 'Salmon traybake', tone: 'smoke' },
  { label: 'Roast chickpeas', tone: 'amber' },
  { label: 'Tahini bowl', tone: 'warm' },
  { label: 'Pickled veg', tone: 'berry' },
  { label: 'Herby falafel', tone: 'herb' },
];

async function getThumbRecipes(): Promise<LiveRecipe[] | null> {
  if (!supabase || !supabaseConfigured) return null;

  // Skip the top 6 (those are in FeaturedRecipes above) and take the next 12 so
  // step-01 thumbs can be horizontally scrolled.
  const { data, error } = await supabase
    .from('recipes_published')
    .select('id, title, image_url')
    .eq('season', 'summer')
    .not('image_url', 'is', null)
    .order('display_priority', { ascending: false })
    .range(6, 17);

  if (error || !data || data.length < 3) return null;
  return data as LiveRecipe[];
}

export default async function BrowseStepThumbs() {
  const recipes = await getThumbRecipes();

  if (!recipes) {
    return (
      <>
        {FALLBACKS.map((f) => (
          <div key={f.label} className="how-thumb">
            <DishPlaceholder label={f.label} tone={f.tone} aspect="1 / 1" />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {recipes.map((r) => (
        <Link key={r.id} href={`/recipes/${r.id}`} className="how-thumb" aria-label={r.title}>
          <div className="how-thumb-image">
            <Image
              src={r.image_url as string}
              alt={r.title}
              width={300}
              height={300}
              sizes="(max-width: 640px) 33vw, 160px"
            />
          </div>
        </Link>
      ))}
    </>
  );
}
