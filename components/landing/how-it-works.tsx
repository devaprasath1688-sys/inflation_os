'use client';

import { motion } from 'framer-motion';
import { UserPlus, ClipboardList, Cpu, Lightbulb, LineChart } from 'lucide-react';
import { SectionHeading } from './section-heading';

const STEPS = [
  { icon: UserPlus, title: 'Create account', desc: 'Free in 30 seconds. No credit card.' },
  { icon: ClipboardList, title: 'Enter financial details', desc: 'Income, savings, expenses, goals.' },
  { icon: Cpu, title: 'AI analyses everything', desc: 'Your personal inflation rate, modeled.' },
  { icon: Lightbulb, title: 'Receive financial insights', desc: 'Clear, tailored, actionable guidance.' },
  { icon: LineChart, title: 'Track your future', desc: 'Watch your wealth projection update live.' },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title={
            <>
              From signup to foresight in <span className="text-gradient">five steps</span>
            </>
          }
          description="No spreadsheets. No finance degree. Just answers."
        />

        <div className="relative mt-16">
          {/* Horizontal connector (desktop) */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-primary via-secondary to-accent lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl glass-strong shadow-lg">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white shadow-md">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
