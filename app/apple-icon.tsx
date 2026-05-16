// Apple touch icon (180×180) — the cleaver mark on the marketing-site
// brand background so it doesn't get iOS's white auto-fill on Home Screen.
//
// Renders at build time via Next.js's app-router icon convention. The PNG
// is read off disk and embedded as a data URI so Satori can rasterise it
// inside the ImageResponse.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const logoPng = readFileSync(join(process.cwd(), 'public', 'logo.png'));
  const dataUri = `data:image/png;base64,${logoPng.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0D0D0D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={132} height={132} alt="" />
      </div>
    ),
    { ...size },
  );
}
