import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import './styles/globals.css';

// Font pairing per the design: Instrument Serif (display) / Geist (UI+body) / JetBrains Mono (meta + numerals).
// Geist ships via the `geist` package (self-hosted by Next) — next/font/google doesn't list it.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chop It — Weekly shop, sorted in minutes',
  description:
    'Chop It plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating — without giving up the meals you love.',
  metadataBase: new URL('https://chop-it.com'),
  openGraph: {
    title: 'Chop It — Weekly shop, sorted in minutes',
    description:
      'Chop It plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating.',
    url: 'https://chop-it.com',
    siteName: 'Chop It',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chop It — Weekly shop, sorted in minutes',
    description:
      'Chop It plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${instrumentSerif.variable} ${GeistSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
