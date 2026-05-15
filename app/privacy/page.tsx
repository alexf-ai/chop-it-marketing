import type { Metadata } from 'next';

import LegalLayout from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Chop it',
  description: 'How Chop it handles your data.',
  alternates: { canonical: 'https://chop-it.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="24 April 2026">
      <p>
        This is a placeholder policy. It will be replaced with a full policy
        (drafted via Termly or similar) before public launch. It is published
        now so the structure, routing, and footer links are in place.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Email addresses</strong> &mdash; used to authenticate your
          account and send transactional messages (password resets, receipts).
        </li>
        <li>
          <strong>Recipe saves and preferences</strong> &mdash; the recipes you
          save, tweak, or rate, so we can personalise your plan and shop.
        </li>
        <li>
          <strong>Usage analytics</strong> &mdash; anonymised events about how
          the app is used so we can find bugs and improve the product.
        </li>
      </ul>

      <h2>Where your data lives</h2>
      <p>
        Account data and recipe preferences are stored on{' '}
        <a href="https://supabase.com" rel="noopener">Supabase</a>, our managed
        Postgres provider. Data is hosted in the EU region.
      </p>

      <h2>Your choices</h2>
      <p>
        You can request that we delete your account and associated data at any
        time by emailing{' '}
        <a href="mailto:secretary@chop-it.com">secretary@chop-it.com</a>. We
        will confirm and complete the deletion within a reasonable period.
      </p>

      <h2>Analytics</h2>
      <p>
        We use PostHog, a product analytics platform, to understand how
        visitors interact with chop-it.com. PostHog records:
      </p>
      <ul>
        <li>Pages viewed and time spent</li>
        <li>Buttons clicked (including app-store links)</li>
        <li>
          Anonymised device type, browser, and country (derived from IP)
        </li>
        <li>Referrer (where you arrived from)</li>
      </ul>
      <p>
        Data is processed in the EU and retained per PostHog&rsquo;s default
        retention policy. We do not record keystrokes, form input, or content
        you paste into the page. You can decline analytics via the cookie
        banner on first visit, or by enabling &lsquo;Do Not Track&rsquo; in
        your browser.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{' '}
        <a href="mailto:secretary@chop-it.com">secretary@chop-it.com</a>.
      </p>
    </LegalLayout>
  );
}
