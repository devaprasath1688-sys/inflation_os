'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 80, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 80, damping: 20, mass: 0.5 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX - 350);
      y.set(e.clientY - 350);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none fixed z-[5] hidden h-[700px] w-[700px] rounded-full md:block"
      style={{
        x: sx,
        y: sy,
        background:
          'radial-gradient(circle, rgba(109,93,246,0.12) 0%, rgba(139,92,246,0.06) 30%, rgba(6,182,212,0.04) 50%, transparent 70%)',
      }}
    />
  );
}
