'use client';

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

export default function Hero({ score, demoRecipes, demoPantryRecipes }: HeroProps) {
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
