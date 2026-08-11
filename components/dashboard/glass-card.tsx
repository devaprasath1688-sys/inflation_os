'use client';

import { ReactNode, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  tilt?: boolean;
}

export function GlassCard({ children, className, hover = true, delay = 0, tilt = true }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 150, damping: 20 });

  const glowX = useTransform(mx, [0, 1], ['0%', '100%']);
  const glowY = useTransform(my, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -6 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={tilt ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      className={cn(
        'glow-border relative overflow-hidden rounded-3xl glass-strong p-6 shadow-premium transition-shadow duration-300',
        hover && 'hover:shadow-premium-lg',
        className,
      )}
    >
      {/* Mouse-follow glow overlay */}
      {tilt && isHovering && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(400px circle at ${x} ${y}, hsl(var(--primary) / 0.08), transparent 70%)`,
            ),
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
