// Block 02 — The cost of not planning. A single big stat moment.
// No icons, no stock imagery. Numbers do the work.
//
// Server component. The Reveal wrappers it renders are client
// components — Next.js renders the section's static HTML and hydrates
// the Reveal subtrees only.

import Reveal from './motion/Reveal';

export default function CostBlock() {
  return (
    <Reveal as="section" className="section cost-block" amount={0.3}>
      <div className="cost-inner" id="cost">
        <div className="kicker mono">— THE COST OF NOT PLANNING</div>
        {/* The h2 with the £60 figure gets a second, delayed Reveal so
            it lands after the surrounding kicker / sub copy. Wrapping
            the whole headline (block-level h2) instead of the inline
            <strong> keeps the inline phrase "throws away £60 a month
            in food." flowing naturally. */}
        <Reveal delay={0.15} y={12}>
          <h2 className="h-editorial cost-h">
            The average UK family throws away{' '}
            <strong>£60 a month</strong> in food.
          </h2>
        </Reveal>
        <p className="cost-sub">
          That’s £14 billion across the UK every year. Sixty percent of it happens at home. Chop It
          is built to stop it happening to you.
        </p>
        <div className="cost-source mono">Source: WRAP, 2024.</div>
      </div>
    </Reveal>
  );
}
