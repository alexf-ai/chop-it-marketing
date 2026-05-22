'use client';

// Client-only wrapper so app/layout.tsx (a server component) can mount
// Motion's MotionConfig. reducedMotion="user" inherits the visitor's OS
// "Reduce motion" preference — Motion-driven animations either run at
// reduced fidelity or skip entirely, depending on each component's
// reducedMotion handling.

import { MotionConfig } from 'motion/react';

export default function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
