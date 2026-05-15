// Server component. Renders the visible breadcrumb trail above the H1 on
// recipe detail pages. The structured-data twin lives in
// app/lib/recipeSchema.ts (buildBreadcrumbJsonLd) — kept in sync via the
// same `crumbs` prop shape.
//
// Semantic markup: <nav aria-label="Breadcrumb"> wrapping an <ol>. The
// final crumb (current page) is rendered without a link and marked
// aria-current="page".

import Link from 'next/link';

export type Crumb = {
  name: string;
  /**
   * URL relative to the site origin. Omit on the final crumb to render
   * it as plain text (current page).
   */
  href?: string;
};

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="breadcrumbs-item">
              {c.href && !isLast ? (
                <Link href={c.href} className="breadcrumbs-link">
                  {c.name}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{c.name}</span>
              )}
              {!isLast && (
                <span className="breadcrumbs-sep" aria-hidden="true">
                  {' '}
                  ›{' '}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
