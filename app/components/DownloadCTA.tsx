'use client';

// Block 08 — Closing CTA. App Store pill is the primary action while
// Android isn't live yet. The Google Play pill is gated on ANDROID_LIVE
// (matches RecipeCTA) so it stays hidden until the listing ships. The
// "Try the web app" outline button is removed for now — Alex wants the
// single primary CTA route through iOS until Android lands; it can come
// back as a third pill when the lineup is complete.

import { motion } from 'motion/react';

import { ANDROID_LIVE, APP_STORE_URL, IOS_LIVE, PLAY_STORE_URL } from '@/app/lib/app-stores';
import {
  trackAppStoreClick,
  trackCtaClicked,
  trackPlayStoreClick,
} from '@/lib/posthog-events';

// Springy press/hover on the pill — feels more native than a CSS
// transition and gives the closing CTA the only interactive flourish
// on the page.
const PILL_HOVER = { scale: 1.03 };
const PILL_TAP = { scale: 0.98 };
const PILL_SPRING = { type: 'spring' as const, stiffness: 400, damping: 25 };

// Shared fade-up for the surrounding copy (heading + sub + sustainability
// anchor). Fires on scroll-in via whileInView so the block lights up as
// the visitor reaches the foot of the page.
const COPY_INITIAL = { opacity: 0, y: 24 };
const COPY_IN_VIEW = { opacity: 1, y: 0 };
const COPY_VIEWPORT = { once: true, amount: 0.3 };
const COPY_TRANSITION = { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] as const };

export default function DownloadCTA() {
  return (
    <section className="section download-cta" id="download">
      <div className="download-cta-inner">
        <motion.div
          initial={COPY_INITIAL}
          whileInView={COPY_IN_VIEW}
          viewport={COPY_VIEWPORT}
          transition={COPY_TRANSITION}
        >
          <div className="kicker mono">— START THIS WEEK</div>
          <h2 className="h-editorial download-cta-h">Eat better this week. Save the planet on the side.</h2>
          <p className="download-cta-sub">
            Free to try. Web, iPhone, and Android. Your weekly shop, sorted in minutes.
          </p>
        </motion.div>
        <div className="download-cta-row">
          <motion.a
            className="store-pill"
            href={APP_STORE_URL}
            rel={IOS_LIVE ? 'noopener noreferrer' : undefined}
            aria-label="Download on the App Store"
            whileHover={PILL_HOVER}
            whileTap={PILL_TAP}
            transition={PILL_SPRING}
            onClick={() => {
              trackAppStoreClick({ location: 'download_cta' });
              trackCtaClicked({
                cta_location: 'homepage_secondary',
                cta_label: 'App Store',
                cta_destination: APP_STORE_URL,
              });
            }}
          >
            <span className="store-pill-top mono">{IOS_LIVE ? 'DOWNLOAD ON THE' : 'COMING SOON'}</span>
            <span className="store-pill-bot">App Store</span>
          </motion.a>
          {ANDROID_LIVE && (
            <motion.a
              className="store-pill"
              href={PLAY_STORE_URL}
              rel="noopener noreferrer"
              aria-label="Get it on Google Play"
              whileHover={PILL_HOVER}
              whileTap={PILL_TAP}
              transition={PILL_SPRING}
              onClick={() => {
                trackPlayStoreClick({ location: 'download_cta' });
                trackCtaClicked({
                  cta_location: 'homepage_secondary',
                  cta_label: 'Google Play',
                  cta_destination: PLAY_STORE_URL,
                });
              }}
            >
              <span className="store-pill-top mono">GET IT ON</span>
              <span className="store-pill-bot">Google Play</span>
            </motion.a>
          )}
        </div>
        <motion.p
          className="download-cta-anchor"
          initial={COPY_INITIAL}
          whileInView={COPY_IN_VIEW}
          viewport={COPY_VIEWPORT}
          transition={{ ...COPY_TRANSITION, delay: 0.1 }}
        >
          The average UK family wastes £1,000 of food a year — the carbon equivalent of driving from
          London to Glasgow and back. Chop it is the easiest way to stop being part of that number.
        </motion.p>
      </div>
    </section>
  );
}
