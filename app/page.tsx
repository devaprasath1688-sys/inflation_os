'use client';

import { MouseGlow } from '@/components/landing/mouse-glow';
import { ParticleBackground } from '@/components/landing/particle-background';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { WhyInflation } from '@/components/landing/why-inflation';
import { Problem } from '@/components/landing/problem';
import { Solution } from '@/components/landing/solution';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';
import { Pricing } from '@/components/landing/pricing';
import { FAQ } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <MouseGlow />
      <ParticleBackground count={20} />
      <Navbar />
      <Hero />
      <WhyInflation />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
