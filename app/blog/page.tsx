import type { Metadata } from 'next';
import Link from 'next/link';

import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import { getAllPostsMeta } from '@/app/lib/blog';
import { buildBreadcrumbJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

const ACCENT = '#E8547A';

const BLOG_TITLE = 'Blog · Chop it';
const BLOG_DESCRIPTION =
  'Guides and comparisons on meal planning, eating with more variety, and wasting less food — from the team building Chop it.';

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: { canonical: `${SITE_ORIGIN}/blog` },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: `${SITE_ORIGIN}/blog`,
    type: 'website',
  },
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();

  const crumbs: Crumb[] = [{ name: 'Home', href: '/' }, { name: 'Blog' }];
  const breadcrumbLd = buildBreadcrumbJsonLd(crumbs);

  // CollectionPage + nested ItemList, mirroring the recipes hub so GSC reads
  // it as a listing pointer (the per-article BlogPosting lives on each post).
  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Chop it Blog',
    description: BLOG_DESCRIPTION,
    url: `${SITE_ORIGIN}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_ORIGIN}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };

  return (
    <>
      <Nav accent={ACCENT} />
      <main>
        <section className="section blog-index">
          <Breadcrumbs crumbs={crumbs} />
          <div className="section-head">
            <div className="kicker mono">— BLOG</div>
            <h1 className="h-editorial">Blog</h1>
            <p className="lead">
              Guides on planning the week, eating with more variety, and wasting less.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="muted">No articles yet. Check back soon.</p>
          ) : (
            <ul className="blog-list">
              {posts.map((p) => (
                <li key={p.slug} className="blog-card">
                  <Link href={`/blog/${p.slug}`} className="blog-card-link">
                    <time className="blog-card-date mono" dateTime={p.datePublished}>
                      {formatDate(p.datePublished)}
                    </time>
                    <h2 className="blog-card-title">{p.title}</h2>
                    <p className="blog-card-desc">{p.description}</p>
                    <span className="blog-card-more mono">Read →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(listLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <Footer />
    </>
  );
}
