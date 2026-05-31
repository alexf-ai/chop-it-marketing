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
    <LegalLayout title="Terms of Use" lastUpdated="31 May 2026">
      <p>
        These terms govern your use of Chop It &mdash; our iOS app, our
        website at chop-it.com, the web app at chopit.app, and any
        integrations that let you use Chop It inside third-party AI
        assistants such as ChatGPT (together, the &ldquo;Service&rdquo;). The
        Service is operated by Chop It AI Ltd, a company registered in
        England and Wales (&ldquo;Chop It&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;). By using the Service you agree to these terms. If
        you do not agree, please do not use the Service.
      </p>

      <h2>Who can use Chop It</h2>
      <p>
        You must be at least 13 years old to use the Service. If you are
        under 18, you should have your parent or guardian&rsquo;s permission.
      </p>

      <h2>Your account</h2>
      <p>
        Some features require an account. You are responsible for keeping
        your login details secure and for activity under your account. You
        can delete your account at any time &mdash; see our{' '}
        <a href="/data-deletion">Data deletion</a> page.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Please use Chop It only for lawful, personal meal-planning purposes.
        You agree not to:
      </p>
      <ul>
        <li>
          copy, scrape, resell, or redistribute our recipe catalogue or other
          content;
        </li>
        <li>
          reverse engineer, disrupt, or attempt to gain unauthorised access
          to the Service;
        </li>
        <li>
          use the Service to break the law or infringe anyone&rsquo;s rights.
        </li>
      </ul>

      <h2>Recipes, nutrition information and AI features</h2>
      <p>
        Chop It uses AI to generate and adapt recipes, suggest meal plans,
        and produce information such as the Weekly Diversity Score and
        nutrition estimates.
      </p>
      <ul>
        <li>
          This information is general guidance to help you plan and eat more
          varied meals. It is not professional dietary, medical, or
          nutritional advice.
        </li>
        <li>
          Always check ingredients and packaging yourself for allergens,
          intolerances, and dietary requirements. If you have a medical
          condition or specific dietary needs, consult a qualified
          professional.
        </li>
        <li>
          Nutrition figures and the Weekly Diversity Score are estimates and
          directional indicators, not guaranteed values.
        </li>
        <li>
          Cook food safely and to appropriate temperatures. You are
          responsible for the meals you prepare.
        </li>
      </ul>

      <h2>Purchases and subscriptions</h2>
      <ul>
        <li>
          Purchases made through the iOS app (credits and Pro subscriptions)
          are processed by Apple and governed by{' '}
          <a
            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            rel="noopener"
            target="_blank"
          >
            Apple&rsquo;s Standard End User License Agreement
          </a>{' '}
          in addition to these terms.
        </li>
        <li>
          Purchases made on the web are processed by Stripe. We never see or
          store your card details.
        </li>
        <li>
          Subscriptions renew automatically until cancelled. Manage or cancel
          iOS subscriptions in your Apple account settings; manage web
          subscriptions as described at checkout.
        </li>
        <li>
          Your statutory rights, including any right to cancel under UK
          consumer law, are not affected by these terms.
        </li>
      </ul>

      <h2>Shopping and third-party services</h2>
      <p>
        Chop It can hand your shopping list to third-party grocery and basket
        services so you can buy ingredients from a retailer of your choice.
        Those services are operated by third parties under their own terms
        and privacy policies. We are not responsible for their availability,
        pricing, fulfilment, or the goods you buy through them. Chop It does
        not sell groceries.
      </p>

      <h2>Your content</h2>
      <p>
        You keep ownership of the recipes, photos, and meal plans you create
        or upload. You grant us a licence to store and process that content
        so we can provide the Service to you (for example, generating
        shopping lists or improving a recipe you import). You are responsible
        for ensuring you have the right to upload anything you add.
      </p>

      <h2>Our content</h2>
      <p>
        The Chop It name, logo, recipe catalogue, Weekly Diversity Score,
        and the Service itself are owned by Chop It AI Ltd or our licensors.
        You may use them only as part of normal use of the Service.
      </p>

      <h2>Availability</h2>
      <p>
        We work hard to keep the Service running but provide it &ldquo;as
        is&rdquo; and &ldquo;as available&rdquo;. We do not guarantee it
        will always be uninterrupted or error-free, and we may change or
        withdraw features.
      </p>

      <h2>Liability</h2>
      <p>
        Nothing in these terms limits our liability for death or personal
        injury caused by our negligence, for fraud, or for anything else
        that cannot be limited under English law. Subject to that, we are
        not liable for losses that are not reasonably foreseeable, or that
        arise from your misuse of the Service or reliance on AI-generated
        guidance contrary to the cautions above.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Material changes will
        be notified in-app or by email. Continued use of the Service after
        a change means you accept the updated terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the law of England and Wales, and
        disputes are subject to the courts of England and Wales.
      </p>

      <h2>Contact</h2>
      <p>
        Chop It AI Ltd, England and Wales &mdash;{' '}
        <a href="mailto:hello@chop-it.com">hello@chop-it.com</a>
      </p>
    </LegalLayout>
  );
}
