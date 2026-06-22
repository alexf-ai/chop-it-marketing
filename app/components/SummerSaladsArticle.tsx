// Editorial wrapper for the interactive "This week's dinners" salad post.
//
// Hand-written copy around the SaladExplorer (the data-driven, interactive
// part). Kept as its own component so app/blog/[slug]/page.tsx can branch to
// it for the one menu-backed post without bloating the markdown path.

import Link from 'next/link';

import SaladExplorer from '@/app/components/SaladExplorer';
import type { FullMenuRecipe } from '@/app/lib/menuRecipes';

type Props = {
  recipes: FullMenuRecipe[];
  menuUrl: string;
  datePublished: string;
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function SummerSaladsArticle({ recipes, menuUrl, datePublished }: Props) {
  return (
    <article className="salad-article">
      <header className="salad-hero">
        <div className="kicker mono">— THIS WEEK&rsquo;S DINNERS 👇</div>
        <h1 className="salad-hero-h">{recipes.length} easy summer salads to cook this week</h1>
        <p className="salad-hero-lead">
          Salads that hold their own as dinner — not a sad bowl of leaves next to the
          &ldquo;real&rdquo; food. Every one is built the same way: something with bite, something
          that fills you up, and a dressing sharp enough to make you go back for more. Tap any salad
          to see the ingredients and method, then send the whole shop to your phone in one go.
        </p>
        <div className="salad-hero-cta">
          <Link className="btn btn-primary" href={menuUrl}>
            Get the shopping list in Chop It
          </Link>
          <span className="salad-hero-meta mono">
            Updated {formatDate(datePublished)} · Shopping list ready
          </span>
        </div>
      </header>

      <div className="salad-intro">
        <p>
          There are {recipes.length} here, which is more than any one week needs — that&rsquo;s the
          point. Treat it as a pantry of options: pick four or five, lean on what&rsquo;s cheap and
          good that week, and let the rest wait. A few are ten-minute assemblies (watermelon, feta
          and mint); a few want a hot pan and ten minutes of attention (charred tenderstem, grilled
          peach). Most land somewhere in between.
        </p>
        <p>
          The annoying part of cooking from a list like this has always been the shopping — 49
          recipes is a few hundred ingredients, half of them overlapping. So the lazy version is
          built in: choose the salads you want in Chop It and it merges everything into one shopping
          list, deduped and sorted by aisle. No app needed to read the recipes below; the app just
          saves you copying them out by hand.
        </p>
      </div>

      <SaladExplorer recipes={recipes} menuUrl={menuUrl} />

      <section className="salad-outro">
        <h2 className="salad-outro-h">Send the whole list to your phone</h2>
        <p>
          Open the menu in Chop It and the entire week becomes one shopping list — quantities added
          up across salads, duplicates merged, everything grouped by aisle so you&rsquo;re not
          doubling back for the second bunch of mint. Tick things off as you shop, then pull up the
          method for whichever salad you&rsquo;re making that night.
        </p>
        <div className="salad-outro-cta">
          <Link className="btn btn-primary" href={menuUrl}>
            Cook this in Chop It →
          </Link>
          <Link className="btn btn-ghost" href="/">
            What is Chop It?
          </Link>
        </div>
        <p className="salad-pin mono">📌 Pin this for the week</p>
      </section>
    </article>
  );
}
