'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Wallet, ArrowDownRight } from 'lucide-react';
import { SectionHeading } from './section-heading';

export function WhyInflation() {
  return (
    <section id="why" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Silent Thief"
          title={
            <>
              Why Inflation <span className="text-gradient">Matters</span>
            </>
          }
          description="Inflation erodes your purchasing power silently. Understanding it is the first step to protecting your financial future."
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          {/* Animated illustration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="glow-border rounded-3xl glass-strong p-8 shadow-2xl shadow-warning/10">
              <div className="space-y-6">
                {/* Salary bar */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <Wallet className="h-4 w-4 text-success" /> Your Salary
                    </span>
                    <span className="font-semibold text-success">+5%</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-xl bg-muted">
                    <motion.div
                      className="h-full rounded-xl bg-gradient-to-r from-success to-success/70"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '55%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Inflation bar */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <TrendingUp className="h-4 w-4 text-destructive" /> Inflation
                    </span>
                    <span className="font-semibold text-destructive">+8%</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-xl bg-muted">
                    <motion.div
                      className="h-full rounded-xl bg-gradient-to-r from-destructive to-warning"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '85%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Result
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Purchasing power */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <TrendingDown className="h-4 w-4 text-destructive" /> Purchasing Power
                    </span>
                    <span className="font-semibold text-destructive">-3%</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-xl bg-muted">
                    <motion.div
                      className="h-full rounded-xl bg-gradient-to-r from-warning to-destructive"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '42%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.4 }}
                className="mt-6 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
              >
                <ArrowDownRight className="h-4 w-4 shrink-0" />
                <span>
                  Even with a raise, you can buy <strong>less</strong> next year than today.
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-6"
          >
            <h3 className="font-display text-2xl font-bold sm:text-3xl">
              A raise doesn&apos;t always mean you&apos;re richer.
            </h3>
            <p className="text-base text-muted-foreground sm:text-lg">
              When prices rise faster than your income, every rupee you earn buys a
              little less. Over decades, this invisible gap can quietly drain lakhs
              from your savings and retirement.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { stat: '₹100 today', note: '≈ ₹78 in 5 years', sub: 'at 5% inflation' },
                { stat: '₹1 Crore retirement', note: '≈ ₹55.4 Lakh in 10 years', sub: 'at 6% inflation' },
              ].map((item) => (
                <div key={item.stat} className="rounded-2xl glass p-5">
                  <p className="font-display text-lg font-bold">{item.stat}</p>
                  <p className="mt-1 text-sm text-destructive">{item.note}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              InflationOS shows you exactly how much your money loses — and what to do
              about it before it&apos;s too late.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
