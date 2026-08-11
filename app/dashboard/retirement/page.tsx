'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency, formatCurrencyFull } from '@/lib/finance';

export default function RetirementPage() {
  const { finance, onboarding } = useDashboard();
  if (!finance || !onboarding) return <FinanceLoading />;

  const r = finance.retirement;
  const age = onboarding.personal.age || 30;
  const yearsToRetire = 60 - age;
  const gapPositive = r.gap >= 0;
  const gapPct = r.corpus > 0 ? Math.min(100, (r.corpus / (r.corpus - r.gap)) * 100) : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Retirement Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI estimates for your retirement corpus and pension needs.</p>
      </div>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 rounded-2xl p-4 ${gapPositive ? 'bg-success/10' : 'bg-destructive/10'}`}
      >
        {gapPositive ? <CheckCircle2 className="h-6 w-6 text-success" /> : <AlertTriangle className="h-6 w-6 text-destructive" />}
        <div>
          <p className={`font-semibold ${gapPositive ? 'text-success' : 'text-destructive'}`}>
            {gapPositive ? 'You are on track for retirement!' : 'You have a retirement gap to close.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {gapPositive
              ? `Projected surplus of ${formatCurrency(r.gap)} above your needed corpus.`
              : `You need ${formatCurrency(Math.abs(r.gap))} more to retire comfortably.`}
          </p>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="mb-2 flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Projected Corpus</p></div>
          <p className="font-display text-xl font-bold">{formatCurrency(r.corpus)}</p>
          <p className="mt-1 text-xs text-muted-foreground">at age 60</p>
        </GlassCard>
        <GlassCard delay={0.05}>
          <div className="mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Monthly Pension</p></div>
          <p className="font-display text-xl font-bold text-success">{formatCurrency(r.monthlyPension)}</p>
          <p className="mt-1 text-xs text-muted-foreground">needed post-retirement</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <div className="mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-warning" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Inflation-Adjusted Expenses</p></div>
          <p className="font-display text-xl font-bold text-warning">{formatCurrency(r.inflationAdjustedExpenses)}</p>
          <p className="mt-1 text-xs text-muted-foreground">per month at retirement</p>
        </GlassCard>
        <GlassCard delay={0.15}>
          <div className="mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Gap Analysis</p></div>
          <p className={`font-display text-xl font-bold ${gapPositive ? 'text-success' : 'text-destructive'}`}>{gapPositive ? '+' : ''}{formatCurrency(r.gap)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{gapPositive ? 'surplus' : 'shortfall'}</p>
        </GlassCard>
      </div>

      {/* Gap analysis progress */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Corpus Readiness</h3>
          <span className="ml-auto font-display text-2xl font-bold text-gradient">{gapPct.toFixed(0)}%</span>
        </div>
        <ProgressBar value={gapPct} className="h-4" />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>Today</span>
          <span>{yearsToRetire} years to retirement</span>
          <span>Retirement</span>
        </div>
      </GlassCard>

      {/* AI recommendation */}
      <GlassCard delay={0.1}>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">AI Retirement Strategy</h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            At age <span className="font-semibold text-foreground">{age}</span>, with {yearsToRetire} years to retirement, your projected corpus is{' '}
            <span className="font-semibold text-foreground">{formatCurrencyFull(r.corpus)}</span>.
          </p>
          <p>
            Your monthly expenses of {formatCurrency(finance.monthlyExpenses)} will inflate to{' '}
            <span className="font-semibold text-warning">{formatCurrencyFull(r.inflationAdjustedExpenses)}</span> by retirement due to your personal inflation rate of {finance.personalInflationIndex}%.
          </p>
          {gapPositive ? (
            <p className="rounded-xl bg-success/10 p-3 text-success">
              You are on track. To build a buffer, consider increasing your SIP by 10% annually and reviewing your allocation yearly.
            </p>
          ) : (
            <p className="rounded-xl bg-destructive/10 p-3 text-destructive">
              To close the gap of {formatCurrency(Math.abs(r.gap))}, increase your monthly SIP by {formatCurrency(Math.round(Math.abs(r.gap) / (yearsToRetire * 12)))} or delay retirement by 2-3 years.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
