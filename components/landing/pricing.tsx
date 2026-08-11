'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Building2 } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { MagneticButton } from './magnetic-button';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: '/forever',
    desc: 'Everything you need to understand your inflation.',
    features: [
      'Personal Inflation Index',
      'Expense Analyzer',
      'Financial Health Score',
      'Basic AI Assistant (10 q/mo)',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '₹1,499',
    period: '/month',
    desc: 'Full AI intelligence for your entire financial life.',
    features: [
      'Everything in Free',
      'AI Budget Planner',
      'Investment Advisor',
      'Retirement Planner',
      'Future Wealth Prediction',
      'Unlimited AI Assistant',
      'PDF Reports',
      'Goal Tracker',
    ],
    cta: 'Start 14-Day Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For teams, advisors, and organizations.',
    features: [
      'Everything in Premium',
      'Multi-user accounts',
      'Advisor dashboard',
      'API access',
      'Custom inflation baskets',
      'Dedicated support',
      'SSO & compliance',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Plans that <span className="text-gradient">pay for themselves</span>
            </>
          }
          description="Start free. Upgrade when you are ready to see your future."
        />

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative flex flex-col rounded-3xl p-7 ${
                plan.highlight
                  ? 'glass-strong shadow-2xl shadow-primary/20 glow-border lg:scale-105'
                  : 'glass shadow-lg'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-semibold text-white shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="mb-5 flex items-center gap-2">
                {plan.name === 'Enterprise' ? (
                  <Building2 className="h-5 w-5 text-primary" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              </div>
              <div className="mb-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mb-7 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                      <Check className="h-3 w-3 text-success" />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <MagneticButton className="w-full">
                  <a
                    href="/signup"
                    className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40'
                        : 'glass-strong hover:shadow-lg'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </MagneticButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
