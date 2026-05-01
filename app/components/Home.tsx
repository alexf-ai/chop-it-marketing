'use client';

import { useEffect, useState, type ReactNode } from 'react';

import Nav from './Nav';
import Hero from './Hero';
import CostBlock from './CostBlock';
import WhatItDoes from './WhatItDoes';
import PantrySection from './PantrySection';
import ScoreExplainer from './ScoreExplainer';
import HowItWorks from './HowItWorks';
import type { PhoneMeal } from './PhoneMock';
import Principles from './Principles';
import DownloadCTA from './DownloadCTA';
import Footer from './Footer';
import Tweaks, { type TweakState } from './Tweaks';

import { ACCENTS } from '@/app/lib/score';

// Edit-mode defaults — score is at 78 (top of "Good" / bottom of "Excellent")
// so the first impression on the marketing site is a passing demo state.
const TWEAK_DEFAULTS: TweakState = {
  score: 78,
  accent: 'pink',
};

type HomeProps = {
  featuredRecipes: ReactNode;
  browseThumbs: ReactNode;
  pantryShowcase: ReactNode;
  phoneMeals?: PhoneMeal[];
};

export default function Home({ featuredRecipes, browseThumbs, pantryShowcase, phoneMeals }: HomeProps) {
  const [state, setState] = useState<TweakState>(TWEAK_DEFAULTS);
  const [tweaksOn, setTweaksOn] = useState(false);

  const accent = ACCENTS[state.accent] ?? ACCENTS.pink;

  // Inject the live accent CSS variable. The nav wordmark dot + buttons read this.
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  // Edit-mode postMessage protocol — matches the prototype so Claude Design's edit overlay works
  // when the site is embedded in an iframe. No-op in normal hosting.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksOn(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOn(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Persist current tweak state to the parent frame.
  useEffect(() => {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: state }, '*');
  }, [state]);

  return (
    <>
      <Nav accent={accent} />
      <Hero score={state.score} accent={accent} phoneMeals={phoneMeals} />
      <CostBlock />
      <div id="what">
        <WhatItDoes />
      </div>
      <PantrySection pantryShowcase={pantryShowcase} />
      <div id="score">
        <ScoreExplainer
          score={state.score}
          setScore={(s) => setState({ ...state, score: s })}
          accent={accent}
        />
      </div>
      <div id="recipes">{featuredRecipes}</div>
      <HowItWorks browseThumbs={browseThumbs} />
      <Principles />
      <DownloadCTA accent={accent} />
      <Footer />
      {tweaksOn && <Tweaks state={state} setState={setState} onClose={() => setTweaksOn(false)} />}
    </>
  );
}
