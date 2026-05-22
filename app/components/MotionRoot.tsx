'use client';

// LazyMotion with the `domAnimation` features bundle is roughly half
// the size of the default motion import. `strict` enforces the `m`
// component pattern — using `motion.*` anywhere downstream will throw
// at runtime, which keeps future contributors honest about bundle
// discipline.

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

export default function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
