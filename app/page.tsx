import BrowseStepThumbs from './components/BrowseStepThumbs';
import FeaturedRecipes from './components/FeaturedRecipes';
import Home from './components/Home';
import PantryShowcase from './components/PantryShowcase';
import { getDemoPantryRecipes, getDemoRecipes } from './lib/homepageDemo';

export const revalidate = 3600;

export default async function Page() {
  // Pre-fetch both the This Week + Pantry recipe sets server-side so the
  // phone simulator has real, SEO-visible HTML on first paint and the
  // client bundle stays free of supabase-js. Pantry results are static-
  // ish enough (always seeded with "chicken") that there's no value in
  // a client-side fetch on tab activation.
  const [demoRecipes, demoPantryRecipes] = await Promise.all([
    getDemoRecipes(),
    getDemoPantryRecipes(),
  ]);
  return (
    <Home
      featuredRecipes={<FeaturedRecipes />}
      browseThumbs={<BrowseStepThumbs />}
      pantryShowcase={<PantryShowcase />}
      demoRecipes={demoRecipes}
      demoPantryRecipes={demoPantryRecipes}
    />
  );
}
