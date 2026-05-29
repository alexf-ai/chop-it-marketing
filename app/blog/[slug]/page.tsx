import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import { BLOG_AUTHOR, getAllPostsMeta, getPostBody, getPostMeta } from '@/app/lib/blog';
import { buildBreadcrumbJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

// Articles are file-backed (content/blog/<slug>.md). Prerender every known
// slug at build and reject anything else, so getPostBody's fs read only ever
// runs at build time.
export const dynamicParams = false;

const ACCENT = '#E8547A';

export function generateStaticParams() {
  return getAllPostsMeta().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) return { title: 'Article not found · Chop it' };

  const url = `${SITE_ORIGIN}/blog/${post.slug}`;
  return {
    title: `${post.title} · Chop it`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: new Date(`${post.datePublished}T00:00:00Z`).toISOString(),
      modifiedTime: new Date(`${post.dateModified}T00:00:00Z`).toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) notFound();

  const body = getPostBody(slug);
  const url = `${SITE_ORIGIN}/blog/${post.slug}`;

  const crumbs: Crumb[] = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title },
  ];
  const breadcrumbLd = buildBreadcrumbJsonLd(crumbs);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline: post.title,
    description: post.description,
    datePublished: new Date(`${post.datePublished}T00:00:00Z`).toISOString(),
    dateModified: new Date(`${post.dateModified}T00:00:00Z`).toISOString(),
    author: { '@type': 'Organization', name: BLOG_AUTHOR, url: SITE_ORIGIN },
    publisher: {
      '@type': 'Organization',
      name: BLOG_AUTHOR,
      url: SITE_ORIGIN,
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.webp` },
    },
    mainEntityOfPage: url,
    image: `${SITE_ORIGIN}/logo.webp`,
  };

  return (
    <>
      <Nav accent={ACCENT} />
      <main>
        <article className="blog-article">
          <Breadcrumbs crumbs={crumbs} />
          <div className="blog-article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
        </article>
      </main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
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
