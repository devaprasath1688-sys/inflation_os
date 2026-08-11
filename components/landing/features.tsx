'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  Gauge,
  PiggyBank,
  LineChart,
  ShieldCheck,
  CalendarClock,
  Sparkles,
  HeartPulse,
  Receipt,
  Target,
  Bot,
  FileText,
} from 'lucide-react';
import { SectionHeading } from './section-heading';

const FEATURES = [
  { icon: Wallet, title: 'AI Budget Planner', desc: 'A budget that adapts to inflation and your life — automatically.' },
  { icon: Gauge, title: 'Personal Inflation Index', desc: 'Your real inflation rate, based on what you actually buy.' },
  { icon: PiggyBank, title: 'Savings Planner', desc: 'Know exactly how much to save to hit every goal on time.' },
  { icon: LineChart, title: 'Investment Advisor', desc: 'AI-tailored portfolios designed to outpace your inflation.' },
  { icon: ShieldCheck, title: 'Emergency Fund Calculator', desc: 'Right-size your safety net for today — and tomorrow.' },
  { icon: CalendarClock, title: 'Retirement Planner', desc: 'See if you can retire at 55, 60, or 65 — in real rupees.' },
  { icon: Sparkles, title: 'Future Wealth Prediction', desc: 'Project your net worth 20 years forward, inflation-adjusted.' },
  { icon: HeartPulse, title: 'Financial Health Score', desc: 'One number that tells you if you are on track or behind.' },
  { icon: Receipt, title: 'Expense Analyzer', desc: 'Auto-categorized spending with inflation-aware insights.' },
  { icon: Target, title: 'Goal Tracker', desc: 'Set milestones and watch inflation-adjusted progress live.' },
  { icon: Bot, title: 'AI Assistant', desc: 'Ask any money question. Get instant, personalized answers.' },
  { icon: FileText, title: 'PDF Reports', desc: 'Beautiful, shareable financial reports for you or your advisor.' },
];

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need to <span className="text-gradient">outsmart inflation</span>
            </>
          }
          description="Twelve AI-powered tools that work together to protect, grow, and future-proof your money."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl glass p-6 transition-shadow hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              </div>

              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-all duration-300 group-hover:from-primary group-hover:to-secondary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1.5 font-display text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
