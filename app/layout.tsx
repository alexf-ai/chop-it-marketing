import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './styles/globals.css';

// Hybrid type system: Instrument Serif for display headings, JetBrains Mono for meta/numerals,
// system-ui stack for body copy so we match the PWA visually (PWA is system-font-only under CSP).
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
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
