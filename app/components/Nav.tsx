'use client';

import Image from 'next/image';
import Link from 'next/link';

import { trackNavCtaClick } from '@/lib/posthog-events';

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
          <a href="#score">Diversity Score</a>
          <a href="#recipes">Recipes</a>
          <a href="#how">How it works</a>
          <a href="#">Feasts</a>
        </div>
        <div className="nav-cta">
          <a
            className="nav-link-tertiary"
            href="#"
            onClick={() => trackNavCtaClick({ destination: 'sign_in', location: 'nav' })}
          >
            Sign in
          </a>
          <a
            className="btn btn-primary"
            style={{ background: accent }}
            href="#"
            onClick={() => trackNavCtaClick({ destination: 'get_app', location: 'nav' })}
          >
            Get the app
          </a>
        </div>
      </div>
    </nav>
  );
}
