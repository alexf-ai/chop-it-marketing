'use client';

// Parent variant container. Children that use the matching StaggerItem
// variants inherit hidden → show automatically with the staggerChildren
// timing below. amount is intentionally lower than Reveal's default
// (0.15) because stagger animations look better when they kick off
// earlier in the scroll — the lead card might already be in view.
//
// staggerChildren tunes per call site: 0.06 for a tight grid (6 recipe
// cards), 0.12 for a slower list (3 How-It-Works steps), default 0.08
// elsewhere.

import { m } from 'motion/react';

type Props = {
  children: React.ReactNode;
  stagger?: number; // default 0.08
  className?: string;
  amount?: number; // default 0.15
};

export default function StaggerGroup({
  children,
  stagger = 0.08,
  className,
  amount = 0.15,
}: Props) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }}
    >
      {children}
    </m.div>
  );
}
