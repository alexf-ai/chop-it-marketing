'use client';

import { motion } from 'motion/react';

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

// Single easing curve across the page — matches the ScoreRing
// stroke-dashoffset transition for one visual vocabulary.
const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

export default function Hero({ score, demoRecipes, demoPantryRecipes }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-eyebrow">
            {/* Pulse keyframe left alone — already runs in CSS and is
                guarded by the prefers-reduced-motion block. */}
            <span className="pulse" />
            <span className="mono">NEW · WEEKLY DIVERSITY SCORE</span>
          </div>
          <motion.h1
            className="hero-h"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="hero-h-line">Eat better this week,</span>
            <span className="hero-h-line">
              <em>without giving up what you love.</em>
            </span>
          </motion.h1>
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
          >
            Chop it plans the week, writes the shop, and quietly nudges you toward more variety,
            more plants, more fibre, less waste. Without giving up the lasagne on Friday!
          </motion.p>
          <hr className="hero-separator" aria-hidden="true" />
        </div>
        {/* Wrap the PhoneSimulator container, NOT the simulator internals
            — its own ScoreRing + tab animations stay untouched. */}
        <motion.div
          className="hero-right"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        >
          <PhoneSimulator
            initialRecipes={demoRecipes}
            pantryRecipes={demoPantryRecipes}
            score={score}
            band={PHONE_DEMO_BAND}
          />
        </motion.div>
      </div>
      {/* Search lives in its own full-width row below the hero grid so it
          never competes for column width with the phone simulator. On
          mobile this stacks cleanly under the phone; on desktop it spans
          the hero centered. */}
      <motion.div
        className="hero-search-row"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <DemoSearchBar />
      </motion.div>
    </header>
  );
}
