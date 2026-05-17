import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './styles/globals.css';

import CookieBanner from './components/CookieBanner';

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
  title: 'Chop it — Weekly shop, sorted in minutes',
  description:
    'Chop it plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating — without giving up the meals you love.',
  metadataBase: new URL('https://chop-it.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Chop it — Weekly shop, sorted in minutes',
    description:
      'Chop it plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating.',
    url: 'https://chop-it.com',
    siteName: 'Chop it',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chop it — Weekly shop, sorted in minutes',
    description:
      'Chop it plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating.',
  },
  // Google Search Console — URL-prefix property verification.
  // Property: https://chop-it.com
  // Once GSC has crawled this tag and verified ownership, this entry can be
  // left in place (no harm) or removed in a later cleanup pass — Google
  // only re-checks if ownership is challenged.
  verification: {
    google: 'kqSyATyhUHmcDShKvUNWK-Ntj3n9qrdB8omXiM6tft0',
  },
};

const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Chop it',
  url: 'https://chop-it.com',
  logo: 'https://chop-it.com/logo.webp',
  description:
    'Chop it plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating.',
  sameAs: ['https://chopit.app'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        {children}
        {/* WaitlistStickyBar hidden for now alongside the hero form. */}
        <CookieBanner />
      </body>
    </html>
  );
}
