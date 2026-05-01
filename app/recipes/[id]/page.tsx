import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import { getAllRecipeIds, getRecipeById } from '@/app/lib/recipes';

export const revalidate = 3600;

export async function generateStaticParams() {
  const ids = await getAllRecipeIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) return { title: 'Recipe not found · Chop It' };
  return {
    title: `${recipe.title} · Chop It`,
    description: `Ingredients and method for ${recipe.title}.`,
    openGraph: {
      title: `${recipe.title} · Chop It`,
      images: recipe.image_url ? [recipe.image_url] : [],
    },
  };
}

const ACCENT = '#E8547A';

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  const ingredients = recipe.ingredients_json ?? [];
  const steps = recipe.method_steps_json ?? [];
  const t = recipe.timings_json;
  const hasNutrition =
    recipe.nutrition_kcal != null ||
    recipe.nutrition_protein_g != null ||
    recipe.nutrition_fibre_g != null;

  return (
    <>
      <Nav accent={ACCENT} />
      <article className="recipe-page">
        <Link href="/#recipes" className="recipe-back mono">
          ← All recipes
        </Link>

        {recipe.image_url && (
          <div className="recipe-page-hero">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              width={1200}
              height={1500}
              priority
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>
        )}

        <header className="recipe-page-header">
          <h1 className="recipe-page-title">{recipe.title}</h1>
          {(t?.prep_minutes != null ||
            t?.cook_minutes != null ||
            t?.total_minutes != null ||
            recipe.servings != null) && (
            <ul className="recipe-meta-strip mono">
              {t?.prep_minutes != null && (
                <li>
                  <span className="meta-k">Prep</span>
                  <span className="meta-v">{t.prep_minutes} min</span>
                </li>
              )}
              {t?.cook_minutes != null && (
                <li>
                  <span className="meta-k">Cook</span>
                  <span className="meta-v">{t.cook_minutes} min</span>
                </li>
              )}
              {t?.total_minutes != null && (
                <li>
                  <span className="meta-k">Total</span>
                  <span className="meta-v">{t.total_minutes} min</span>
                </li>
              )}
              {recipe.servings != null && (
                <li>
                  <span className="meta-k">Serves</span>
                  <span className="meta-v">{recipe.servings}</span>
                </li>
              )}
            </ul>
          )}
        </header>

        {ingredients.length > 0 && (
          <section className="recipe-section">
            <h2 className="recipe-h">Ingredients</h2>
            <ul className="recipe-ingredients">
              {ingredients.map((ing, i) => (
                <li key={i} className={ing.optional ? 'optional' : ''}>
                  {ing.display}
                </li>
              ))}
            </ul>
          </section>
        )}

        {steps.length > 0 && (
          <section className="recipe-section">
            <h2 className="recipe-h">Method</h2>
            <ol className="recipe-method">
              {steps.map((s, i) => (
                <li key={i}>{s.text}</li>
              ))}
            </ol>
          </section>
        )}

        {hasNutrition && (
          <section className="recipe-section">
            <h2 className="recipe-h">Per serving</h2>
            <ul className="recipe-nutrition mono">
              {recipe.nutrition_kcal != null && (
                <li>
                  <span className="meta-v">{recipe.nutrition_kcal}</span>
                  <span className="meta-k">kcal</span>
                </li>
              )}
              {recipe.nutrition_protein_g != null && (
                <li>
                  <span className="meta-v">{recipe.nutrition_protein_g}g</span>
                  <span className="meta-k">protein</span>
                </li>
              )}
              {recipe.nutrition_fibre_g != null && (
                <li>
                  <span className="meta-v">{recipe.nutrition_fibre_g}g</span>
                  <span className="meta-k">fibre</span>
                </li>
              )}
              {recipe.nutrition_carbs_g != null && (
                <li>
                  <span className="meta-v">{recipe.nutrition_carbs_g}g</span>
                  <span className="meta-k">carbs</span>
                </li>
              )}
              {recipe.nutrition_fat_g != null && (
                <li>
                  <span className="meta-v">{recipe.nutrition_fat_g}g</span>
                  <span className="meta-k">fat</span>
                </li>
              )}
            </ul>
          </section>
        )}
      </article>
      <Footer />
    </>
  );
}
