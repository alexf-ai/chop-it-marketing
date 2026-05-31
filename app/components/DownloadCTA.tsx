'use client';

// Block 08 — Closing CTA. App Store pill is the primary action while
// Android isn't live yet. The Google Play pill renders alongside in a
// "COMING SOON" state so visitors see both platforms are coming — its
// href/eyebrow flip to the live PLAY_STORE_URL when ANDROID_LIVE turns
// true. The "Try the web app" outline button is removed for now — Alex
// wants the single primary CTA route through iOS until Android lands;
// it can come back as a third pill when the lineup is complete.

import { m } from 'motion/react';

import {
  ANDROID_LIVE,
  APP_STORE_URL,
  CHATGPT_LIVE,
  CHATGPT_URL,
  IOS_LIVE,
  PLAY_STORE_URL,
} from '@/app/lib/app-stores';
import {
  trackAppStoreClick,
  trackChatgptClick,
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
        <m.div
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
        </m.div>
        <div className="download-cta-row">
          <m.a
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
          </m.a>
          {ANDROID_LIVE ? (
            <m.a
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
            </m.a>
          ) : (
            // ANDROID_LIVE is false — render the pill as a non-clickable
            // "COMING SOON" placeholder so visitors still see Android is
            // planned. href="#" stays inert; tracking captures intent
            // ("how many tap Coming Soon Android?"). Falls through to the
            // live URL automatically when ANDROID_LIVE flips.
            <m.a
              className="store-pill"
              href="#"
              aria-label="Google Play — coming soon"
              whileHover={PILL_HOVER}
              whileTap={PILL_TAP}
              transition={PILL_SPRING}
              onClick={(e) => {
                e.preventDefault();
                trackPlayStoreClick({ location: 'download_cta' });
                trackCtaClicked({
                  cta_location: 'homepage_secondary',
                  cta_label: 'Google Play (coming soon)',
                  cta_destination: '#',
                });
              }}
            >
              <span className="store-pill-top mono">COMING SOON</span>
              <span className="store-pill-bot">Google Play</span>
            </m.a>
          )}
          {/* ChatGPT entry point — opens the "Weekly Food Shop Planner"
              custom GPT. Third surface alongside the native stores; rendered
              unconditionally while CHATGPT_LIVE is true. */}
          {CHATGPT_LIVE && (
            <m.a
              className="store-pill"
              href={CHATGPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Try Chop It on ChatGPT"
              whileHover={PILL_HOVER}
              whileTap={PILL_TAP}
              transition={PILL_SPRING}
              onClick={() => {
                trackChatgptClick({ location: 'download_cta' });
                trackCtaClicked({
                  cta_location: 'homepage_secondary',
                  cta_label: 'ChatGPT',
                  cta_destination: CHATGPT_URL,
                });
              }}
            >
              <span className="store-pill-top mono">TRY IT ON</span>
              <span className="store-pill-bot">ChatGPT</span>
            </m.a>
          )}
        </div>
        <m.p
          className="download-cta-anchor"
          initial={COPY_INITIAL}
          whileInView={COPY_IN_VIEW}
          viewport={COPY_VIEWPORT}
          transition={{ ...COPY_TRANSITION, delay: 0.1 }}
        >
          The average UK family wastes £1,000 of food a year — the carbon equivalent of driving from
          London to Glasgow and back. Chop it is the easiest way to stop being part of that number.
        </m.p>
      </div>
    </section>
  );
}
