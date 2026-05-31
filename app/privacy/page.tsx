import type { Metadata } from 'next';

import LegalLayout from '../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Chop It',
  description:
    'How Chop It collects, uses, and protects your data under UK GDPR.',
  alternates: { canonical: 'https://chop-it.com/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="31 May 2026">
      <p>
        Chop It AI Ltd (&ldquo;Chop It&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
        operates the Chop It mobile app and chop-it.com website (the
        &ldquo;Service&rdquo;). This policy explains what data we collect, why,
        and your rights under UK GDPR and the Data Protection Act 2018.
      </p>
      <p>
        <strong>Data Controller:</strong> Chop It AI Ltd, registered in England
        and Wales.
        <br />
        <strong>Contact:</strong>{' '}
        <a href="mailto:hello@chop-it.com">hello@chop-it.com</a>
      </p>

      <h2>What we collect</h2>

      <h3>Account data</h3>
      <ul>
        <li>Email address, account ID, sign-in method (Apple, Google, email)</li>
        <li>Created when you sign up; used to authenticate you</li>
      </ul>

      <h3>Content you create</h3>
      <ul>
        <li>Recipes you save, import, or generate</li>
        <li>Meal plans, shopping lists, pantry contents, dietary preferences</li>
        <li>Photos you upload (e.g. pantry items, recipe imports)</li>
      </ul>

      <h3>Subscription and purchase data</h3>
      <ul>
        <li>Apple In-App Purchase transaction IDs (via RevenueCat)</li>
        <li>Stripe customer ID and payment status (for web purchases only)</li>
        <li>
          We never see or store your card number &mdash; payment is handled by
          Apple or Stripe
        </li>
      </ul>

      <h3>Usage analytics</h3>
      <ul>
        <li>
          Pseudonymous events: which features you use, screen views, errors
        </li>
        <li>Processed by PostHog (analytics) and Sentry (error reporting)</li>
        <li>
          Linked to a random analytics identifier, not your name or email. Your
          IP address may be processed by these tools for security and
          approximate location, and is not used to build a marketing profile.
        </li>
      </ul>

      <h3>Device data (automatic)</h3>
      <ul>
        <li>IP address, device model, OS version, app version</li>
        <li>Used for security, fraud prevention, and to fix bugs</li>
      </ul>

      <h2>Why we collect it (legal bases)</h2>
      <ul>
        <li>
          <strong>Contract performance</strong> &mdash; to provide the meal
          planning, recipe storage, and subscription services you sign up for
        </li>
        <li>
          <strong>Legitimate interests</strong> &mdash; to improve the app, fix
          bugs, and prevent abuse
        </li>
        <li>
          <strong>Consent</strong> &mdash; for optional features like marketing
          email (where applicable)
        </li>
        <li>
          <strong>Legal obligation</strong> &mdash; to keep records for tax and
          accounting
        </li>
      </ul>

      <h2>Who we share data with</h2>
      <p>
        We use the following processors. Each one only sees the data necessary
        to do its job:
      </p>
      <ul>
        <li>Supabase (database and authentication) &mdash; EU/US</li>
        <li>Apple App Store and RevenueCat (iOS purchases) &mdash; US</li>
        <li>Stripe (web purchases) &mdash; UK/EU/US</li>
        <li>Cloudflare Images (photo storage) &mdash; global CDN</li>
        <li>PostHog (product analytics) &mdash; EU</li>
        <li>Sentry (crash reporting) &mdash; EU/US</li>
        <li>
          Anthropic (AI features &mdash; recipe generation, meal suggestions)
          &mdash; US
        </li>
        <li>
          OpenAI (AI features &mdash; image generation, transcription) &mdash;
          US
        </li>
      </ul>
      <p>
        We send only the minimum data required for each AI feature to function
        (for example, a recipe title or ingredient list). We never sell your
        personal data. We do not share it with advertisers.
      </p>

      <h2>Using Chop It in ChatGPT and other AI assistants</h2>
      <p>
        You can use Chop It inside ChatGPT and similar AI assistants without a
        Chop It account. When you do:
      </p>
      <ul>
        <li>
          We receive only the request you send (e.g. &ldquo;build me 5 dinners
          under 30 minutes&rdquo;) and a temporary session identifier created
          for that conversation. We do not receive your wider chat history.
        </li>
        <li>
          We use it to search our recipe catalogue, build a draft meal plan,
          and generate a consolidated shopping list, which we return to the
          assistant to show you.
        </li>
        <li>
          In this guest mode we do not create an account or store personal
          identifiers. Temporary session data is discarded after a short
          period.
        </li>
        <li>
          Your conversation with the assistant is also governed by that
          assistant provider&rsquo;s own privacy policy (for ChatGPT,
          OpenAI&rsquo;s).
        </li>
      </ul>
      <p>
        If you later link a Chop It account, the account data terms above
        apply.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account data: until you delete your account</li>
        <li>
          Content (recipes, meal plans): until you delete your account or the
          individual item
        </li>
        <li>Analytics: up to 12 months, pseudonymised</li>
        <li>Financial records: 6 years (UK statutory requirement)</li>
        <li>Crash reports: 90 days</li>
      </ul>

      <h2>Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul>
        <li>Access the data we hold about you</li>
        <li>Correct inaccurate data</li>
        <li>
          Delete your account and associated data (available in-app: Settings
          &rarr; Delete Account, or see{' '}
          <a href="https://chop-it.com/data-deletion">
            https://chop-it.com/data-deletion
          </a>
          )
        </li>
        <li>Export your data in a portable format</li>
        <li>Object to processing or withdraw consent</li>
        <li>
          Complain to the Information Commissioner&rsquo;s Office (
          <a href="https://ico.org.uk" rel="noopener">
            ico.org.uk
          </a>
          )
        </li>
      </ul>
      <p>
        To exercise any of these rights, email{' '}
        <a href="mailto:hello@chop-it.com">hello@chop-it.com</a>. We respond
        within 30 days.
      </p>

      <h2 id="account-deletion">Account deletion</h2>
      <p>
        You can delete your account at any time from within the app: Settings
        &rarr; Delete Account. This permanently removes your recipes, meal
        plans, pantry, shopping lists, and account identifiers. Anonymous
        analytics records may be retained but cannot be linked back to you.
      </p>
      <p>
        For details on what is deleted and retained, see{' '}
        <a href="https://chop-it.com/data-deletion">
          https://chop-it.com/data-deletion
        </a>
        .
      </p>

      <h2>Children</h2>
      <p>
        Chop It is not directed at children under 13. We do not knowingly
        collect data from children under 13. If you believe a child has
        provided us with personal data, email{' '}
        <a href="mailto:hello@chop-it.com">hello@chop-it.com</a> and we will
        delete it.
      </p>

      <h2>International transfers</h2>
      <p>
        Some of our processors are based outside the UK and EU. We use Standard
        Contractual Clauses or equivalent safeguards to ensure your data is
        protected to UK GDPR standards regardless of where it is processed.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        notified in-app or by email. The &ldquo;Last updated&rdquo; date at the
        top of this page shows when it was last revised.
      </p>

      <h2>Contact</h2>
      <ul>
        <li>
          Email: <a href="mailto:hello@chop-it.com">hello@chop-it.com</a>
        </li>
        <li>Company: Chop It AI Ltd, England and Wales</li>
      </ul>
      <p>
        If you are not satisfied with our response, you can contact the UK
        Information Commissioner&rsquo;s Office at{' '}
        <a href="https://ico.org.uk" rel="noopener">
          ico.org.uk
        </a>
        .
      </p>
    </LegalLayout>
  );
}
