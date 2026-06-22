// Blog post registry for the /blog SEO articles.
//
// Two halves, kept deliberately separate:
//   - BLOG_POSTS: metadata only (no fs). Safe to import anywhere on the
//     server — the /blog index, generateMetadata, JSON-LD, and the sitemap
//     route all read from here without touching the filesystem.
//   - getPostBody(): reads the markdown body from content/blog/<slug>.md.
//     Only called from app/blog/[slug]/page.tsx, which is fully prerendered
//     (generateStaticParams + dynamicParams=false + static), so the fs read
//     happens at BUILD time and never inside a request-time function.
//
// To add an article: drop content/blog/<slug>.md and add a BLOG_POSTS entry.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const BLOG_AUTHOR = 'Chop it';

export type BlogPostMeta = {
  slug: string;
  /** Used as the visible-page intent, the SEO <title> base, and JSON-LD headline. */
  title: string;
  /** Meta description (~150–160 chars). */
  description: string;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  /** ISO date (YYYY-MM-DD). */
  dateModified: string;
  /**
   * Set for interactive recipe-menu posts (e.g. "This week's dinners"). The
   * post body is rendered from the shared menu with this code rather than a
   * markdown file, so getPostBody() is never called for it.
   */
  menuShareCode?: string;
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'easy-summer-salads-this-weeks-dinners',
    title: '49 Easy Summer Salads to Cook This Week',
    description:
      'A full week of easy summer salads you can actually make dinner — each with ingredients and method, plus a one-tap shopping list for the whole lot in Chop It.',
    datePublished: '2026-06-22',
    dateModified: '2026-06-22',
    menuShareCode: 'MDSAP7JV',
  },
  {
    slug: 'how-to-meal-plan-for-the-week',
    title: 'How to Meal Plan for the Week (A Simple System That Sticks)',
    description:
      'A meal-planning method that survives a real week: pick 4–5 dinners, write one merged shopping list, shop once. Plus how to keep the habit going.',
    datePublished: '2026-06-16',
    dateModified: '2026-06-16',
  },
  {
    slug: 'how-to-reduce-food-waste-at-home',
    title: 'How to Reduce Food Waste at Home (A Practical UK Guide)',
    description:
      'UK households bin about £14bn of food a year, mostly from shopping without a plan. The four habits that cut the most waste, and the money, at home.',
    datePublished: '2026-06-16',
    dateModified: '2026-06-16',
  },
  {
    slug: 'how-much-fibre-do-you-need-a-day',
    title: 'How Much Fibre Do You Need a Day? (And How to Actually Eat It)',
    description:
      'The UK target is 30g of fibre a day; most adults get about 20g and only ~9% hit it. The simple swaps that close the gap without counting grams.',
    datePublished: '2026-06-16',
    dateModified: '2026-06-16',
  },
  {
    slug: 'why-chatgpt-changes-home-cooking-and-grocery-shopping',
    title: 'Why ChatGPT Is About to Change How Britain Cooks and Shops for Food',
    description:
      "Online grocery digitised delivery but not the decision of what to cook. Here's why conversational AI is the missing layer, and how it changes the weekly shop.",
    datePublished: '2026-05-31',
    dateModified: '2026-05-31',
  },
  {
    slug: 'how-to-eat-30-plants-a-week',
    title: 'How to Eat 30 Plants a Week (and What Actually Counts)',
    description:
      "What the 30-plants-a-week gut-health rule actually means, exactly what counts (herbs, spices, nuts, coffee all do), and how to hit it without a spreadsheet.",
    datePublished: '2026-05-31',
    dateModified: '2026-05-31',
  },
  {
    slug: 'best-meal-planning-apps-uk-2026',
    title: 'Best Meal Planning Apps in the UK for 2026',
    description:
      'We compare Good Food, Paprika, Samsung Food, Mealime, AnyList, Mob and Chop It — ranked by the job you want done, from biggest recipe library to more variety.',
    datePublished: '2026-05-29',
    dateModified: '2026-05-29',
  },
];

/** Newest first, for the index listing. */
export function getAllPostsMeta(): BlogPostMeta[] {
  return [...BLOG_POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}

export function getPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Build-time only — see file header. */
export function getPostBody(slug: string): string {
  return readFileSync(join(process.cwd(), 'content', 'blog', `${slug}.md`), 'utf8');
}
