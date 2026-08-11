'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, IndianRupee, PiggyBank, LineChart, Coins } from 'lucide-react';
import { MagneticButton } from './magnetic-button';
import { AnimatedCounter } from './animated-counter';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from 'recharts';

const heroData = [
  { x: '0', v: 40 },
  { x: '1', v: 55 },
  { x: '2', v: 48 },
  { x: '3', v: 70 },
  { x: '4', v: 62 },
  { x: '5', v: 88 },
  { x: '6', v: 78 },
  { x: '7', v: 95 },
];

const STATS = [
  { label: 'People Protected', value: 142000, suffix: '+' },
  { label: 'Money Saved', value: 38, prefix: '₹', suffix: ' Cr+' },
  { label: 'Predictions Generated', value: 1200000, suffix: '+' },
  { label: 'Investment Plans', value: 84000, suffix: '+' },
];

const FLOATERS = [
  { icon: IndianRupee, className: 'left-[6%] top-[22%]', delay: 0, size: 'h-14 w-14' },
  { icon: TrendingUp, className: 'right-[8%] top-[18%]', delay: 0.6, size: 'h-16 w-16' },
  { icon: PiggyBank, className: 'left-[12%] bottom-[18%]', delay: 1.2, size: 'h-12 w-12' },
  { icon: LineChart, className: 'right-[12%] bottom-[22%]', delay: 0.9, size: 'h-14 w-14' },
  { icon: Coins, className: 'left-[44%] top-[12%]', delay: 1.5, size: 'h-11 w-11' },
];

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-grid pt-28"
    >
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <motion.div
          className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Floating finance objects */}
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className={`absolute ${f.className} hidden md:block`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: f.delay, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
            className={`${f.size} flex items-center justify-center rounded-2xl glass shadow-xl shadow-primary/10`}
          >
            <f.icon className="h-1/2 w-1/2 text-primary" />
          </motion.div>
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium"
        >
          <span className="flex h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-muted-foreground">AI-Powered Financial Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Inflation is Invisible.
          <br />
          <span className="text-gradient">Your Financial Future</span>
          <br />
          Shouldn&apos;t Be.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-7 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl"
        >
          AI-powered financial intelligence that predicts how inflation affects YOUR
          salary, savings, investments and future lifestyle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <MagneticButton>
            <a
              href="/signup"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40"
            >
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </MagneticButton>
          <MagneticButton>
            <a
              href="#solution"
              className="group flex items-center gap-2 rounded-2xl glass-strong px-7 py-3.5 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              <Play className="h-4 w-4 fill-current" />
              See Live Demo
            </a>
          </MagneticButton>
        </motion.div>

        {/* Floating chart card */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="perspective-1000 mx-auto mt-16 max-w-3xl"
        >
          <div className="glow-border rounded-3xl glass-strong p-6 shadow-2xl shadow-primary/10 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Your Predicted Wealth</p>
                  <p className="text-xs text-muted-foreground">Next 10 years · inflation-adjusted</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gradient-accent">+137%</p>
                <p className="text-xs text-success">▲ vs. do nothing</p>
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={heroData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="x" hide />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(20,20,30,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff',
                    }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#heroGrad)"
                    animationDuration={1800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Animated stats */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-2xl font-bold text-gradient sm:text-3xl md:text-4xl">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
