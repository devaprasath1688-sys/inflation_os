'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealthScoreProps {
  value: number;
  size?: number;
}

export function HealthScore({ value, size = 160 }: HealthScoreProps) {
  const [display, setDisplay] = useState(0);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / 1600, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  const label = value >= 75 ? 'Excellent' : value >= 50 ? 'Fair' : 'Needs Work';
  const offset = circumference - (circumference * value) / 100;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.p className="font-display text-4xl font-bold" style={{ color }}>
          {Math.round(display)}
        </motion.p>
        <p className="text-xs text-muted-foreground">/ 100</p>
        <p className="mt-1 text-xs font-medium" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}
