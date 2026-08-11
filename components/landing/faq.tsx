'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeading } from './section-heading';

const FAQS = [
  {
    q: 'What is a personal inflation index?',
    a: 'Instead of the national average, InflationOS calculates inflation based on the things you actually spend money on. If you drive a lot, fuel matters more. If you rent, housing dominates. Your number is yours.',
  },
  {
    q: 'How does the AI predict my future wealth?',
    a: 'We model your income, savings rate, expenses, and investment allocation against projected inflation curves, then simulate thousands of scenarios to show the most likely path for your net worth over 5, 10, and 20 years.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'Yes. All data is encrypted in transit and at rest. We never sell your data. You can export or delete everything at any time. We use bank-grade security infrastructure.',
  },
  {
    q: 'Do I need to connect my bank accounts?',
    a: 'No. You can get started by simply entering your numbers manually. Bank connections are optional and available on Premium for automatic expense tracking.',
  },
  {
    q: 'Can InflationOS replace my financial advisor?',
    a: 'It is a powerful complement. Many users use InflationOS alongside an advisor — or instead of one for straightforward situations. The AI assistant answers most day-to-day questions instantly.',
  },
  {
    q: 'What happens after my free trial?',
    a: 'You keep your Free plan forever — no credit card required. If you upgrade to Premium and cancel, you simply drop back to Free. No surprises, no lock-in.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Questions, <span className="text-gradient">answered</span>
            </>
          }
          description="Everything you need to know before you start."
        />

        <div className="mt-12">
          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl glass px-6 transition-shadow data-[state=open]:shadow-lg"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
