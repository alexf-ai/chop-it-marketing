'use client';

import { trackCtaClicked, trackNavCtaClick } from '@/lib/posthog-events';

import type { DemoPantryRecipe, DemoRecipe } from '@/app/lib/homepageDemo';
import DemoSearchBar from './interactive-demo/DemoSearchBar';
import PhoneSimulator from './interactive-demo/PhoneSimulator';

type HeroProps = {
  score: number;
  accent: string;
  demoRecipes: DemoRecipe[];
  demoPantryRecipes: DemoPantryRecipe[];
};

const PHONE_DEMO_BAND = 'Good';

export default function Hero({ score, accent, demoRecipes, demoPantryRecipes }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="pulse" />
            <span className="mono">NEW · WEEKLY DIVERSITY SCORE</span>
          </div>
          <h1 className="hero-h">
            <span className="hero-h-line">Eat better this week,</span>
            <span className="hero-h-line">
              <em>without giving up what you love.</em>
            </span>
          </h1>
          <p className="hero-sub">
            Chop it plans the week, writes the shop, and quietly nudges you toward more variety,
            more plants, more fibre, less waste. Without giving up the lasagne on Friday.
          </p>
          <div className="hero-cta">
            <a
              className="btn btn-primary"
              style={{ background: accent }}
              href="https://chopit.app"
              onClick={() => {
                trackNavCtaClick({ destination: 'web_app', location: 'hero' });
                trackCtaClicked({
                  cta_location: 'homepage_hero',
                  cta_label: 'Try the web app',
                  cta_destination: 'https://chopit.app',
                });
              }}
            >
              Try the web app
            </a>
            <a
              className="hero-cta-link"
              href="#how"
              onClick={() => {
                trackNavCtaClick({ destination: 'see_how_it_works', location: 'hero' });
                trackCtaClicked({
                  cta_location: 'homepage_secondary',
                  cta_label: 'See how it works',
                  cta_destination: '#how',
                });
              }}
            >
              See how it works →
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-k mono">TARGET PLANTS / WK</div>
              <div className="hero-stat-v">
                30<span className="dot">.</span>
              </div>
            </div>
            <div>
              <div className="hero-stat-k mono">PANS ON THE HOB</div>
              <div className="hero-stat-v">
                2<span className="dot">.</span>
              </div>
            </div>
            <div>
              <div className="hero-stat-k mono">ACTIVE TIME</div>
              <div className="hero-stat-v">
                &lt;30m<span className="dot">.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <PhoneSimulator
            initialRecipes={demoRecipes}
            pantryRecipes={demoPantryRecipes}
            score={score}
            band={PHONE_DEMO_BAND}
          />
        </div>
      </div>
      {/* Search lives in its own full-width row below the hero grid so it
          never competes for column width with the phone simulator. On
          mobile this stacks cleanly under the phone; on desktop it spans
          the hero centered. */}
      <div className="hero-search-row">
        <DemoSearchBar />
      </div>
    </header>
  );
}
