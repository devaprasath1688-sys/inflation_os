'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Twitter, Github, Linkedin, Mail, ArrowRight } from 'lucide-react';

const LINKS = {
  Product: ['Features', 'Pricing', 'Dashboard', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Help Center', 'Documentation', 'API', 'Community'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer id="footer" className="relative overflow-hidden border-t border-border bg-grid">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 rounded-3xl glass-strong p-8 text-center shadow-xl sm:p-12"
        >
          <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Ready to see your <span className="text-gradient">financial future?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Join 142,000+ people who stopped guessing and started planning. Free forever.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-xl glass px-4 py-3 text-sm outline-none ring-primary/40 focus:ring-2"
              required
            />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
            >
              {submitted ? 'Subscribed!' : 'Get Started'}
              {!submitted && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </motion.div>

        {/* Links grid */}
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">
                Inflation<span className="text-gradient">OS</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              AI-powered financial intelligence that predicts how inflation affects your
              salary, savings, investments and future lifestyle.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl glass transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InflationOS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Know Your Future Before Inflation Changes It.
          </p>
        </div>
      </div>
    </footer>
  );
}
