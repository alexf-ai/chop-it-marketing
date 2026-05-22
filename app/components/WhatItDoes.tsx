// "Four things, done well." Server component; the Reveal +
// StaggerGroup + StaggerItem wrappers it renders are client components.

import Reveal from './motion/Reveal';
import StaggerGroup from './motion/StaggerGroup';
import StaggerItem from './motion/StaggerItem';

type Item = { kicker: string; title: string; body: string; accent: string };

const ITEMS: Item[] = [
  {
    kicker: '01',
    title: 'Plan the week, not the meal',
    body: 'Drop recipes into a week. Drag to re-order. Portions scale to your household.',
    accent: '#E8547A',
  },
  {
    kicker: '02',
    title: 'One smart shop',
    body: 'Ingredients aggregated, pantry-aware, sorted by aisle. No double buying the coriander.',
    accent: '#F5A623',
  },
  {
    kicker: '03',
    title: 'Scored for variety',
    body: 'A weekly read on protein, fibre, and plants. One number. Small, achievable swaps.',
    accent: '#6DC56E',
  },
  {
    kicker: '04',
    title: 'Snap a recipe, any recipe',
    body: 'Cookbook page, handwritten scrawl, something you saw online. We write it up properly.',
    accent: '#7F77DD',
  },
];

export default function WhatItDoes() {
  return (
    <section className="section what">
      <Reveal>
        <div className="section-head">
          <div className="kicker mono">— WHAT CHOP IT DOES</div>
          <h2 className="h-editorial">
            Four things, done well. <span className="muted">Nothing you don&rsquo;t need.</span>
          </h2>
        </div>
      </Reveal>
      <StaggerGroup className="what-grid">
        {ITEMS.map((it, i) => (
          <StaggerItem key={i} className="what-card">
            <div className="what-kicker mono" style={{ color: it.accent }}>
              {it.kicker}
            </div>
            <div className="what-title">{it.title}</div>
            <div className="what-body">{it.body}</div>
            <div className="what-rule" style={{ background: it.accent }} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
