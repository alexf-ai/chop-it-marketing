'use client';

// Block 08 — Closing CTA. App Store pill is the primary action while
// Android isn't live yet. The Google Play pill is gated on ANDROID_LIVE
// (matches RecipeCTA) so it stays hidden until the listing ships. The
// "Try the web app" outline button is removed for now — Alex wants the
// single primary CTA route through iOS until Android lands; it can come
// back as a third pill when the lineup is complete.

import { ANDROID_LIVE, APP_STORE_URL, IOS_LIVE, PLAY_STORE_URL } from '@/app/lib/app-stores';
import {
  trackAppStoreClick,
  trackCtaClicked,
  trackPlayStoreClick,
} from '@/lib/posthog-events';

export default function DownloadCTA() {
  return (
    <section className="section download-cta" id="download">
      <div className="download-cta-inner">
        <div className="kicker mono">— START THIS WEEK</div>
        <h2 className="h-editorial download-cta-h">Eat better this week. Save the planet on the side.</h2>
        <p className="download-cta-sub">
          Free to try. Web, iPhone, and Android. Your weekly shop, sorted in minutes.
        </p>
        <div className="download-cta-row">
          <a
            className="store-pill"
            href={APP_STORE_URL}
            rel={IOS_LIVE ? 'noopener noreferrer' : undefined}
            aria-label="Download on the App Store"
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
          </a>
          {ANDROID_LIVE && (
            <a
              className="store-pill"
              href={PLAY_STORE_URL}
              rel="noopener noreferrer"
              aria-label="Get it on Google Play"
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
            </a>
          )}
        </div>
        <p className="download-cta-anchor">
          The average UK family wastes £1,000 of food a year — the carbon equivalent of driving from
          London to Glasgow and back. Chop it is the easiest way to stop being part of that number.
        </p>
      </div>
    </section>
  );
}
