// Per-post social card: the article title on the brand card, so a shared
// blog link previews with its headline rather than the generic site card.
// Mirrors the look of the site-wide app/opengraph-image.tsx (dark ground,
// serif wordmark, diversity-ring motif) and is prerendered for every known
// slug, matching the page's generateStaticParams.

import { ImageResponse } from 'next/og';

import { getAllPostsMeta, getPostMeta } from '@/app/lib/blog';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Chop it — Blog';

// Locked pillar colours, kept in sync with the site-wide OG card and the
// in-app Weekly Diversity Score rings.
const PROTEIN = '#E8547A';
const FIBRE = '#F5A623';
const PLANTS = '#6DC56E';
const BG = '#0D0D0D';
const TEXT = '#F5F5F0';
const MUTED = '#9A9A9A';

export function generateStaticParams() {
  return getAllPostsMeta().map((p) => ({ slug: p.slug }));
}

export default async function BlogOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostMeta(slug);
  const title = post?.title ?? 'Chop it — Blog';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          position: 'relative',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Diversity-score motif: three concentric pillar rings, top-right */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
          }}
        >
          <div
            style={{ position: 'absolute', width: 120, height: 120, borderRadius: 999, border: `7px solid ${PLANTS}` }}
          />
          <div
            style={{ position: 'absolute', width: 86, height: 86, borderRadius: 999, border: `7px solid ${FIBRE}` }}
          />
          <div
            style={{ position: 'absolute', width: 52, height: 52, borderRadius: 999, border: `7px solid ${PROTEIN}` }}
          />
        </div>

        <div style={{ fontSize: 34, color: MUTED, letterSpacing: '-0.01em' }}>Chop it · Blog</div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            color: TEXT,
            letterSpacing: '-0.02em',
            lineHeight: 1.12,
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: 30, fontStyle: 'italic', color: MUTED }}>chop-it.com/blog</div>
      </div>
    ),
    { ...size },
  );
}
