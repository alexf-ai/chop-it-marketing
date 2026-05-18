import type { Metadata } from 'next';

import LegalLayout from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Use | Chop It',
  description:
    'Chop It uses Apple’s standard End User License Agreement for iOS in-app purchases.',
  alternates: { canonical: 'https://chop-it.com/terms' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" lastUpdated="18 May 2026">
      <p>
        Chop It uses Apple&rsquo;s standard End User License Agreement for
        in-app purchases on iOS. The full text is available at the link below.
      </p>
      <p>
        <a
          href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          rel="noopener"
          target="_blank"
        >
          View the Apple Standard EULA
        </a>
      </p>
      <p>
        For questions about your account or data, see our{' '}
        <a href="/privacy">Privacy Policy</a> or email{' '}
        <a href="mailto:hello@chop-it.com">hello@chop-it.com</a>.
      </p>
    </LegalLayout>
  );
}
