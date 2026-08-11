'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Cpu, LayoutDashboard, LineChart, TrendingUp, HeartPulse } from 'lucide-react';
import { SectionHeading } from './section-heading';

const STEPS = [
  { icon: ClipboardList, title: 'Enter your salary', desc: 'Share your income, savings, expenses and goals in 2 minutes.' },
  { icon: Cpu, title: 'AI analyses everything', desc: 'Our engine models your personal inflation rate and future costs.' },
  { icon: LayoutDashboard, title: 'Dashboard generated', desc: 'See your full financial picture in one beautiful, live dashboard.' },
  { icon: LineChart, title: 'Investment suggestions', desc: 'Get tailored asset allocations that beat your personal inflation.' },
  { icon: TrendingUp, title: 'Future prediction', desc: 'Visualize your wealth 5, 10, 20 years out — adjusted for inflation.' },
  { icon: HeartPulse, title: 'Financial health score', desc: 'A single number that tells you if you are on track — or falling behind.' },
];

export function Solution() {
  return (
    <section id="solution" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute left-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Solution"
          title={
            <>
              InflationOS makes the invisible <span className="text-gradient">visible</span>
            </>
          }
          description="From a few numbers to a full financial flight plan. Here is how your journey unfolds."
        />

        <div className="relative mt-16">
          {/* Vertical line for mobile / horizontal connector for desktop */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-primary via-secondary to-accent lg:block lg:left-0 lg:right-0 lg:top-1/2 lg:h-px lg:w-full lg:bg-gradient-to-r" />

          <div className="grid gap-6 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="group h-full rounded-2xl glass-strong p-6 transition-shadow hover:shadow-xl hover:shadow-primary/10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="font-display text-3xl font-bold text-primary/20">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
