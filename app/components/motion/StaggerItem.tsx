'use client';

// Child item for StaggerGroup. Doesn't drive its own viewport trigger —
// the parent StaggerGroup's whileInView fires the show variant, which
// cascades down through these children with staggerChildren timing.
// y: 20 (slightly less than Reveal's 24) so a stacked list feels
// snappier as items pop in sequence.

import { m } from 'motion/react';

export default function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] },
        },
      }}
    >
      {children}
    </m.div>
  );
}
