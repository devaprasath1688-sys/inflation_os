'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { MagneticButton } from './magnetic-button';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#solution' },
  { label: 'About', href: '#why' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#footer' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6"
    >
      <motion.nav
        animate={{
          paddingTop: scrolled ? 8 : 16,
          paddingBottom: scrolled ? 8 : 16,
        }}
        transition={{ duration: 0.3 }}
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 transition-all duration-300 sm:px-6 ${
          scrolled
            ? 'glass-strong shadow-[0_8px_32px_-12px_rgba(109,93,246,0.25)]'
            : 'glass'
        }`}
      >
        <a href="#home" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary opacity-60 blur-md -z-10" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Inflation<span className="text-gradient">OS</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
          >
            Login
          </a>
          <MagneticButton>
            <a
              href="/signup"
              className="block rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
            >
              Get Started
            </a>
          </MagneticButton>
        </div>

        <button
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl glass-strong p-4 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                <a
                  href="/login"
                  className="rounded-xl px-4 py-2.5 text-center text-sm font-semibold"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary/30"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
