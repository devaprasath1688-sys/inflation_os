'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface InflationGaugeProps {
  value: number;
  nationalAvg?: number;
}

export function InflationGauge({ value, nationalAvg = 5.5 }: InflationGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const radius = 90;
  const circumference = Math.PI * radius; // half circle
  const max = 15;
  const pct = Math.min(value / max, 1);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const color = value > nationalAvg + 2 ? '#ef4444' : value > nationalAvg ? '#f59e0b' : '#10b981';

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d={`M 20 120 A ${radius} ${radius} 0 0 1 200 120`}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          className="text-muted/40"
        />
        {/* Value arc */}
        <motion.path
          d={`M 20 120 A ${radius} ${radius} 0 0 1 200 120`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - circumference * pct }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* National avg marker */}
        <circle
          cx={20 + (180 * (nationalAvg / max))}
          cy={120 - Math.sin(Math.PI * (nationalAvg / max)) * radius}
          r="4"
          fill="#fff"
          stroke="#6D5DF6"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute bottom-2 text-center">
        <p className="font-display text-4xl font-bold" style={{ color }}>
          {display.toFixed(1)}%
        </p>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-white ring-2 ring-primary" />
          National avg: {nationalAvg}%
        </span>
      </div>
    </div>
  );
}
