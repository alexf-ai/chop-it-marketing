'use client';

import Image from 'next/image';
import Link from 'next/link';

import { trackCtaClicked, trackNavCtaClick } from '@/lib/posthog-events';

type NavProps = { accent: string };

export default function Nav({ accent }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="wordmark">
          <Image
            src="/logo.webp"
            alt=""
            width={28}
            height={28}
            className="wordmark-logo"
            priority
          />
          Chop&nbsp;it
        </Link>
        <div className="nav-links">
          {/* Absolute paths so the nav works from any page, not just /.
              Diversity Score + How it works are anchors on the homepage;
              Recipes points at the hub. From a deep page the hash links
              still land on / and then scroll to the section. */}
          <Link href="/#score">Diversity Score</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href="/#how">How it works</Link>
          <a href="#">Feasts</a>
        </div>
        <div className="nav-cta">
          <a
            className="nav-link-tertiary"
            href="#"
            onClick={() => {
              trackNavCtaClick({ destination: 'sign_in', location: 'nav' });
              trackCtaClicked({
                cta_location: 'header_nav',
                cta_label: 'Sign in',
                cta_destination: '#',
              });
            }}
          >
            Sign in
          </a>
          <Link
            className="btn btn-primary"
            style={{ background: accent }}
            href="/#download"
            onClick={() => {
              trackNavCtaClick({ destination: 'get_app', location: 'nav' });
              trackCtaClicked({
                cta_location: 'header_nav',
                cta_label: 'Get the app',
                cta_destination: '/#download',
              });
            }}
          >
            Get the app
          </Link>
        </div>
      </div>
    </nav>
  );
}
