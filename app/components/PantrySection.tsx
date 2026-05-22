// Standalone homepage block for the pantry showcase. Promoted out of
// HowItWorks step 02 so the most demoable feature gets hero-adjacent
// placement. The actual cards come from <PantryShowcase /> via slot —
// its internal horizontal-scroll behaviour stays untouched by the
// Reveal wrapper here (Reveal only animates the section entrance).

import type { ReactNode } from 'react';

import Reveal from './motion/Reveal';

export default function PantrySection({ pantryShowcase }: { pantryShowcase: ReactNode }) {
  return (
    <Reveal as="section" className="section pantry-block" amount={0.15}>
      <div className="section-head" id="pantry">
        <div className="kicker mono">— THE PANTRY</div>
        <h2 className="h-editorial">What’s in your kitchen, what’s for dinner.</h2>
        <p className="lead">
          Tell Chop It what you have. We’ll tell you what to cook with it tonight, this week, or
          before it goes off.
        </p>
      </div>
      <div className="pantry-block-visual">{pantryShowcase}</div>
      <div className="pantry-block-hint mono">
        Tap any ingredient in the app to see what you can cook with it tonight.
      </div>
    </Reveal>
  );
}
