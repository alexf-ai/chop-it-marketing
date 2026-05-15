import type { Metadata } from 'next';

import LegalLayout from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Data Deletion | Chop It',
  description: 'How to request deletion of your Chop It account and associated data.',
  alternates: { canonical: 'https://chop-it.com/data-deletion' },
};

export default function DataDeletionPage() {
  return (
    <LegalLayout title="Data Deletion" lastUpdated="15 May 2026">
      <p>
        You can delete your Chop It account and all associated data at any time.
        We do not retain account data after deletion is processed.
      </p>

      <h2>Delete from inside the app</h2>
      <ol>
        <li>
          Open Chop It at{' '}
          <a href="https://chopit.app" rel="noopener">chopit.app</a> and sign in.
        </li>
        <li>
          Go to <strong>Settings</strong> &rarr; <strong>Account</strong>.
        </li>
        <li>
          Tap <strong>Delete account</strong> and confirm.
        </li>
      </ol>
      <p>
        Your account, saved recipes, preferences, and any third-party login
        identifiers (including Facebook, Instagram, and Google) are removed
        immediately. Anonymous usage analytics are retained in aggregate form
        only and cannot be linked back to you.
      </p>

      <h2>Delete by email</h2>
      <p>
        If you cannot access the app, email{' '}
        <a href="mailto:secretary@chop-it.com">secretary@chop-it.com</a>{' '}
        from the address associated with your account and include the phrase
        &ldquo;Delete my account&rdquo; in the subject line. We will confirm and
        complete the deletion within 30 days, and typically within 72 hours.
      </p>

      <h2>What gets deleted</h2>
      <ul>
        <li>Account email address and authentication identifiers</li>
        <li>Saved recipes, meal plans, and shopping lists</li>
        <li>Pantry data and dietary preferences</li>
        <li>Third-party platform identifiers (Facebook, Instagram, Google)</li>
        <li>Cached thumbnails and images we resolved on your behalf</li>
      </ul>

      <h2>What gets kept</h2>
      <p>
        Anonymised, aggregated usage events (page views, feature usage counts)
        that contain no personal identifiers may be retained for product
        analytics. These records cannot be re-associated with you.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about deletion? Email{' '}
        <a href="mailto:secretary@chop-it.com">secretary@chop-it.com</a>.
      </p>
    </LegalLayout>
  );
}
