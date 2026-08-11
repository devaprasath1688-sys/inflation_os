'use client';

import { useMemo } from 'react';

interface ParticleBackgroundProps {
  count?: number;
  className?: string;
}

export function ParticleBackground({ count = 18, className = '' }: ParticleBackgroundProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 15 + 12,
      delay: Math.random() * 8,
      hue: i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'accent',
    }));
  }, [count]);

  const colorMap: Record<string, string> = {
    primary: 'rgba(109, 93, 246, 0.15)',
    secondary: 'rgba(139, 92, 246, 0.12)',
    accent: 'rgba(6, 182, 212, 0.12)',
  };

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full blur-xl"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size * 4}px`,
            height: `${p.size * 4}px`,
            background: colorMap[p.hue],
            animation: `particle-float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
