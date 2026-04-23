'use client';

import { useEffect, useState } from 'react';

import Nav from './Nav';
import Hero from './Hero';
import WhatItDoes from './WhatItDoes';
import ScoreExplainer from './ScoreExplainer';
import FeaturedRecipes from './FeaturedRecipes';
import HowItWorks from './HowItWorks';
import Voices from './Voices';
import FinalCTA from './FinalCTA';
import Footer from './Footer';
import Tweaks, { type TweakState } from './Tweaks';

import { ACCENTS } from '@/app/lib/score';

// Edit-mode defaults — mirror the /*EDITMODE-BEGIN*/.../*EDITMODE-END*/ block from the prototype.
const TWEAK_DEFAULTS: TweakState = {
  score: 32,
  accent: 'pink',
  showTeam: true,
};

export default function Home() {
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
      <Hero score={state.score} accent={accent} />
      <div id="what">
        <WhatItDoes />
      </div>
      <div id="score">
        <ScoreExplainer
          score={state.score}
          setScore={(s) => setState({ ...state, score: s })}
          accent={accent}
        />
      </div>
      <div id="recipes">
        <FeaturedRecipes />
      </div>
      <div id="how">
        <HowItWorks />
      </div>
      {state.showTeam && <Voices />}
      <FinalCTA accent={accent} />
      <Footer />
      {tweaksOn && <Tweaks state={state} setState={setState} onClose={() => setTweaksOn(false)} />}
    </>
  );
}
