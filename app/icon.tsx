// Browser-tab favicon (32×32) — cleaver on the brand black so the icon
// reads as part of the dark theme everywhere it surfaces (tab strip, tab
// switcher, bookmarks). Rendered at build via the app-router icon convention.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
        <img src={dataUri} width={24} height={24} alt="" />
      </div>
    ),
    { ...size },
  );
}
