'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { SectionHeading } from './section-heading';

const TESTIMONIALS = [
  {
    name: 'Karthik Raman',
    role: 'Software Engineer, Chennai',
    quote: 'InflationOS showed me my "raise" was actually a pay cut after inflation. I renegotiated and got 14% more.',
    avatar: 'KR',
  },
  {
    name: 'Deepika Sundaram',
    role: 'Doctor, Coimbatore',
    quote: 'The retirement planner changed my life. I was aiming for 65 — now I can retire at 58 with my SIP corpus.',
    avatar: 'DS',
  },
  {
    name: 'Arjun Krishnan',
    role: 'Business Owner, Madurai',
    quote: 'I finally understand where my money goes. The expense analyzer found ₹8,000/month I was wasting on unused subscriptions.',
    avatar: 'AK',
  },
  {
    name: 'Lakshmi Narayanan',
    role: 'Teacher, Tiruchirappalli',
    quote: 'The AI assistant answered questions my financial advisor charged me ₹3,000 per session for.',
    avatar: 'LN',
  },
  {
    name: 'Priya Venkatesh',
    role: 'Marketing Lead, Bengaluru',
    quote: 'Beautiful, fast, and genuinely useful. My financial health score went from 62 to 89 in three months.',
    avatar: 'PV',
  },
  {
    name: 'Rajesh Subramanian',
    role: 'Retired Engineer, Salem',
    quote: 'At 67, I was worried my savings would run out. InflationOS proved my PPF and NPS corpus is safe — huge relief.',
    avatar: 'RS',
  },
];

export function Testimonials() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              Loved by people who <span className="text-gradient">took control</span>
            </>
          }
          description="Real stories from real users who stopped guessing and started planning."
        />
      </div>

      {/* Auto-scrolling marquee */}
      <div className="relative mt-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-marquee gap-6">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="w-[340px] shrink-0 rounded-2xl glass-strong p-6 shadow-lg sm:w-[400px]"
            >
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <p className="mb-5 text-sm leading-relaxed text-foreground/90">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-warning text-warning" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
