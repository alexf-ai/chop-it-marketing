import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import { getDistinctTags, listPublishedRecipes } from '@/app/lib/recipes';
import { SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const revalidate = 3600;

export async function generateStaticParams() {
  const tags = await getDistinctTags();
  return tags.map((tag) => ({ tag: encodeURIComponent(tag) }));
}

async function resolveTag(raw: string): Promise<string | null> {
  const decoded = decodeURIComponent(raw);
  const all = await getDistinctTags();
  return all.find((t) => t === decoded) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = await resolveTag(raw);
  if (!tag) return { title: 'Tag not found · Chop it' };
  const url = `${SITE_ORIGIN}/recipes/tag/${encodeURIComponent(tag)}`;
  const title = `${tag} recipes · Chop it`;
  return {
    title,
    description: `Every Chop it recipe tagged ${tag}.`,
    alternates: { canonical: url },
    openGraph: { title, description: `Every Chop it recipe tagged ${tag}.`, url, type: 'website' },
  };
}

const ACCENT = '#E8547A';

export default async function TagHubPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = await resolveTag(raw);
  if (!tag) notFound();

  const { items } = await listPublishedRecipes({ tag, perPage: 48 });

  return (
    <>
      <Nav accent={ACCENT} />
      <section className="section recipes-hub">
        <div className="section-head">
          <div className="kicker mono">— TAG</div>
          <h1 className="h-editorial">{tag}</h1>
          <p className="lead">Every Chop it recipe tagged {tag}.</p>
        </div>
        <RecipeGrid items={items} />
      </section>
      <Footer />
    </>
  );
}
