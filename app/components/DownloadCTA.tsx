'use client';

// Block 08 — Closing CTA. Replaces the old FinalCTA. Three CTAs in a row
// (App Store / Google Play / web) plus a verified sustainability anchor line.

import {
  trackAppStoreClick,
  trackNavCtaClick,
  trackPlayStoreClick,
} from '@/lib/posthog-events';

type DownloadCTAProps = { accent: string };

export default function DownloadCTA({ accent }: DownloadCTAProps) {
  return (
    <section className="section download-cta" id="download">
      <div className="download-cta-inner">
        <div className="kicker mono">— START THIS WEEK</div>
        <h2 className="h-editorial download-cta-h">Eat better this week. Save the planet on the side.</h2>
        <p className="download-cta-sub">
          Free to try. Web, iPhone, and Android. Your weekly shop, sorted in minutes.
        </p>
        <div className="download-cta-row">
          {/* App Store / Google Play badges — placeholder hrefs until live URLs land. */}
          <a
            className="store-pill"
            href="#"
            aria-label="Download on the App Store"
            onClick={() => trackAppStoreClick({ location: 'download_cta' })}
          >
            <span className="store-pill-top mono">DOWNLOAD ON THE</span>
            <span className="store-pill-bot">App Store</span>
          </a>
          <a
            className="store-pill"
            href="#"
            aria-label="Get it on Google Play"
            onClick={() => trackPlayStoreClick({ location: 'download_cta' })}
          >
            <span className="store-pill-top mono">GET IT ON</span>
            <span className="store-pill-bot">Google Play</span>
          </a>
          <a
            className="btn btn-ghost btn-large"
            href="https://chopit.app"
            style={{ borderColor: accent }}
            onClick={() => trackNavCtaClick({ destination: 'web_app', location: 'download_cta' })}
          >
            Try the web app
          </a>
        </div>
        <p className="download-cta-anchor">
          The average UK family wastes £1,000 of food a year — the carbon equivalent of driving from
          London to Glasgow and back. Chop it is the easiest way to stop being part of that number.
        </p>
      </div>
    </section>
  );
}
