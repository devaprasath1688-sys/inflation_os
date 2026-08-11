'use client';

import { motion } from 'framer-motion';
import { HelpCircle, PiggyBank, TrendingDown, CalendarClock, AlertTriangle, LineChart } from 'lucide-react';
import { SectionHeading } from './section-heading';

const PROBLEMS = [
  {
    icon: HelpCircle,
    title: 'How much to save',
    desc: 'Most people guess a random percentage. Without knowing your future costs, that guess is usually wrong.',
  },
  {
    icon: LineChart,
    title: 'Where to invest',
    desc: 'Stocks, bonds, real estate, gold? Choosing blind is gambling. Inflation changes which assets win.',
  },
  {
    icon: TrendingDown,
    title: 'Future purchasing power',
    desc: 'A ₹12 LPA salary in 2035 will not feel like ₹12 LPA today. Almost no one calculates this.',
  },
  {
    icon: CalendarClock,
    title: 'Retirement planning',
    desc: 'Retiring at 60 sounds great — until inflation eats 40% of your nest egg before you spend it.',
  },
  {
    icon: AlertTriangle,
    title: 'Inflation impact',
    desc: 'Inflation hits different people differently. Your personal inflation rate is not the headline number.',
  },
  {
    icon: PiggyBank,
    title: 'Emergency fund size',
    desc: 'A 6-month buffer in 2020 is a 4-month buffer in 2026. Your safety net shrinks without warning.',
  },
];

export function Problem() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-50" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Problem"
          title={
            <>
              Financial decisions feel like <span className="text-gradient">guesswork</span>
            </>
          }
          description="People are expected to plan decades of financial life with nothing but intuition. Here is what that really costs you."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl glass p-6 transition-shadow hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-destructive/20 to-warning/20 text-destructive transition-transform group-hover:scale-110">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:from-primary/5 group-hover:to-accent/5" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
