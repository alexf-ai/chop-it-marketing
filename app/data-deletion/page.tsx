import type { Metadata } from 'next';

import LegalLayout from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Account deletion | Chop It',
  description: 'How to delete your Chop It account and associated data.',
  alternates: { canonical: 'https://chop-it.com/data-deletion' },
  robots: { index: true, follow: true },
};

export default function DataDeletionPage() {
  return (
    <LegalLayout title="How to delete your account" lastUpdated="18 May 2026">
      <h2>From within the app</h2>
      <ul>
        <li>Open Chop It &rarr; Settings &rarr; Delete Account &rarr; Confirm</li>
        <li>
          Your account, recipes, meal plans, pantry, shopping lists, and
          personal identifiers are permanently removed.
        </li>
      </ul>

      <h2>What gets deleted</h2>
      <ul>
        <li>Account email and sign-in credentials</li>
        <li>Saved recipes</li>
        <li>Meal plans and weekly menus</li>
        <li>Pantry items</li>
        <li>Shopping lists</li>
        <li>Subscription history (anonymised for accounting)</li>
        <li>Pantry photos</li>
        <li>
          Analytics events (anonymised, cannot be linked back to you)
        </li>
      </ul>

      <h2>What we retain</h2>
      <ul>
        <li>Financial records (6 years, UK statutory requirement)</li>
        <li>
          Anonymised usage analytics that cannot be linked back to you
        </li>
      </ul>

      <h2>If you can&rsquo;t access the app</h2>
      <p>
        Email <a href="mailto:hello@chop-it.com">hello@chop-it.com</a> from the
        address linked to your account. We will verify and complete the
        deletion within 30 days.
      </p>

      <h2>Questions</h2>
      <p>
        See our <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalLayout>
  );
}
