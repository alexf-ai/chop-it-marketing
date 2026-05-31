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
};

export const BLOG_POSTS: BlogPostMeta[] = [
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
