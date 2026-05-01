import BrowseStepThumbs from './components/BrowseStepThumbs';
import FeaturedRecipes from './components/FeaturedRecipes';
import Home from './components/Home';

export default function Page() {
  return <Home featuredRecipes={<FeaturedRecipes />} browseThumbs={<BrowseStepThumbs />} />;
}
