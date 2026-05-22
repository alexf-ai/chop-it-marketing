'use client';

// Generic fade-up-on-scroll wrapper. once: true so the animation fires
// once per visit per element (no replay on scroll back). amount controls
// how much of the element has to be visible before the trigger fires —
// 0.2 keeps it from feeling lazy on tall sections.
//
// Easing cubic-bezier(0.2, 0.7, 0.2, 1) is the same curve the ScoreRing
// stroke-dashoffset transition uses; keeping all entrances on it gives
// the page a single motion vocabulary.

import { motion } from 'motion/react';

type Props = {
  children: React.ReactNode;
  delay?: number;
  y?: number; // initial Y offset in px, default 24
  as?: 'div' | 'section';
  className?: string;
  amount?: number; // viewport amount, default 0.2
};

export default function Reveal({
  children,
  delay = 0,
  y = 24,
  as = 'div',
  className,
  amount = 0.2,
}: Props) {
  const MotionTag = as === 'section' ? motion.section : motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, delay, ease: [0.2, 0.7, 0.2, 1] },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
