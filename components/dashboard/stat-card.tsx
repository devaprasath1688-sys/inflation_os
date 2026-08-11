'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './glass-card';
import { AnimatedCounter } from '@/components/landing/animated-counter';
import { formatCurrency } from '@/lib/finance';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  color?: string;
  delay?: number;
  isCurrency?: boolean;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, icon: Icon, prefix, suffix, color = 'from-primary to-secondary', delay = 0, isCurrency, trend }: StatCardProps) {
  return (
    <GlassCard delay={delay} tilt={false} className="group relative overflow-hidden">
      {/* Animated gradient blob */}
      <motion.div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl`}
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay * 2 }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            {isCurrency ? formatCurrency(value) : <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />}
          </p>
          {trend && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trend.value >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </motion.p>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </motion.div>
      </div>
    </GlassCard>
  );
}
