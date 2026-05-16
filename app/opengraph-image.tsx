// Open Graph + Twitter share image (1200×630).
//
// Rendered by Next.js's app-router opengraph-image convention. Twitter
// uses a sibling file (twitter-image.tsx) that re-exports this module so
// both endpoints serve the identical asset without duplicating the JSX.
//
// Font: Satori's built-in serif fallback (renders Times-like). Bundle an
// Instrument Serif TTF in /public/fonts/ and pass it via the `fonts`
// option of ImageResponse if we ever want an exact brand match — for
// now the serif fallback is close enough for social previews and keeps
// the repo lightweight.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Chop it — Weekly shop, sorted in minutes';

// Locked pillar colours (must match the in-app Weekly Diversity Score
// rings). Kept in sync with --pink / --amber / --green in globals.css.
const PROTEIN = '#E8547A';
const FIBRE = '#F5A623';
const PLANTS = '#6DC56E';
const BG = '#0D0D0D';
const TEXT = '#F5F5F0';
const MUTED = '#9A9A9A';

export default function OpenGraphImage() {
  const logoPng = readFileSync(join(process.cwd(), 'public', 'logo.png'));
  const logoDataUri = `data:image/png;base64,${logoPng.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
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
            width: 140,
            height: 140,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: 999,
              border: `8px solid ${PLANTS}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 100,
              height: 100,
              borderRadius: 999,
              border: `8px solid ${FIBRE}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 60,
              height: 60,
              borderRadius: 999,
              border: `8px solid ${PROTEIN}`,
            }}
          />
        </div>

        {/* Cleaver mark + wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            marginBottom: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} width={120} height={120} alt="" />
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 140,
              fontWeight: 400,
              color: TEXT,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Chop it
          </div>
        </div>

        <div
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 44,
            fontStyle: 'italic',
            color: MUTED,
            letterSpacing: '-0.01em',
          }}
        >
          Weekly shop, sorted in minutes.
        </div>
      </div>
    ),
    { ...size },
  );
}
