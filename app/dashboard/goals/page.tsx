'use client';

import { motion } from 'framer-motion';
import { Target, Plus, Calendar, TrendingUp } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { GlassCard } from '@/components/dashboard/glass-card';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency, formatCurrencyFull } from '@/lib/finance';
import type { Goal } from '@/lib/types';

export default function GoalsPage() {
  const { goals, finance } = useDashboard();
  if (!finance) return <FinanceLoading />;

  const monthlySavings = finance.monthlySavings;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Goal Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your financial goals with live progress.</p>
        </div>
      </div>

      {goals.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 font-semibold">No goals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add goals during onboarding or create one here.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} delay={i * 0.08} monthlySavings={monthlySavings} />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, delay, monthlySavings }: { goal: Goal; delay: number; monthlySavings: number }) {
  const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const monthsLeft = goal.deadline ? Math.max(1, Math.round((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))) : 12;
  const monthlyRequired = Math.round(remaining / monthsLeft);

  return (
    <GlassCard delay={delay}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">{goal.category}</span>
          </div>
          <h3 className="font-display text-lg font-semibold">{goal.title}</h3>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-gradient">{pct.toFixed(0)}%</p>
        </div>
      </div>

      <div className="mb-2">
        <ProgressBar value={pct} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="font-semibold">{formatCurrency(goal.target_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Saved</p>
          <p className="font-semibold text-success">{formatCurrency(goal.current_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="font-semibold">{formatCurrency(remaining)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Monthly Needed</p>
          <p className="font-semibold text-primary">{formatCurrency(monthlyRequired)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl glass px-3 py-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible'}</span>
        <span className="ml-auto flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          {monthlyRequired <= monthlySavings ? 'On track' : 'Behind'}
        </span>
      </div>
    </GlassCard>
  );
}
