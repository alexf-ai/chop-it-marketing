import type { Metadata } from 'next';

import LegalLayout from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | Chop It',
  description: 'The terms that govern your use of Chop It.',
  alternates: { canonical: 'https://chop-it.com/terms' },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="24 April 2026">
      <p>
        These are placeholder terms. They will be replaced with a full, legally
        reviewed set of terms before public launch. They are published now so
        the structure, routing, and footer links are in place.
      </p>

      <h2>The service</h2>
      <p>
        Chop It is a meal-planning service that helps you plan a week of meals,
        generate a shopping list, track a diversity score, and discover
        recipes. The service is delivered through the chop-it.com website and
        the Chop It mobile apps.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Provide accurate account information and keep it up to date.</li>
        <li>
          Use the service for personal, non-commercial meal planning. Do not
          scrape, resell, or use the service to build a competing product.
        </li>
        <li>
          Do not attempt to disrupt the service, reverse-engineer it, or access
          data you are not entitled to.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The Chop It name, logo, software, recipe library, and diversity-score
        methodology are owned by Chop It Ltd. You may use them only as the
        service allows.
      </p>
      <p>
        Content you create in the app (saved recipes, tweaks, notes, plans)
        remains yours. By using the service you grant Chop It a licence to
        store and process that content so the service can function.
      </p>

      <h2>Not medical advice</h2>
      <p>
        Recipes and the diversity score are general guidance, not medical or
        nutritional advice. If you have allergies, intolerances, or a medical
        condition, consult a qualified professional and verify ingredients
        before cooking. Chop It is not liable for dietary decisions made on
        the basis of the service.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, Chop It is not liable for
        indirect or consequential losses arising from use of the service.
        Nothing in these terms excludes liability that cannot lawfully be
        excluded.
      </p>

      <h2>Termination</h2>
      <p>
        You can stop using the service and request account deletion at any
        time. We may suspend or terminate accounts that breach these terms or
        put the service at risk.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales, and any
        dispute is subject to the exclusive jurisdiction of the courts of
        England and Wales.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the product changes. Material changes
        will be flagged in-app or by email before they take effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{' '}
        <a href="mailto:secretary@chop-it.com">secretary@chop-it.com</a>.
      </p>
    </LegalLayout>
  );
}
