import BrowseStepThumbs from './components/BrowseStepThumbs';
import FeaturedRecipes from './components/FeaturedRecipes';
import Home from './components/Home';
import type { PhoneMeal } from './components/PhoneMock';
import { supabase, supabaseConfigured } from './lib/supabase';

export const revalidate = 3600;

const PHONE_DAYS: Pick<PhoneMeal, 'd' | 'tone'>[] = [
  { d: 'Mon', tone: 'amber' },
  { d: 'Tue', tone: 'herb' },
  { d: 'Wed', tone: 'warm' },
];

async function getPhoneMeals(): Promise<PhoneMeal[] | undefined> {
  if (!supabase || !supabaseConfigured) return undefined;
  // Pick 3 from further down the priority list so they don't duplicate the
  // featured row (0-5) or the step-01 strip (6-17).
  const { data, error } = await supabase
    .from('recipes_published')
    .select('id, title, image_url')
    .eq('season', 'summer')
    .not('image_url', 'is', null)
    .order('display_priority', { ascending: false })
    .range(18, 20);
  if (error || !data || data.length < 3) return undefined;
  return PHONE_DAYS.map((day, i) => ({
    ...day,
    meal: data[i].title as string,
    imageUrl: data[i].image_url as string,
  }));
}

export default async function Page() {
  const phoneMeals = await getPhoneMeals();
  return (
    <Home
      featuredRecipes={<FeaturedRecipes />}
      browseThumbs={<BrowseStepThumbs />}
      phoneMeals={phoneMeals}
    />
  );
}
