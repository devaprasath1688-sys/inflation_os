'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Sliders } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from '@/components/dashboard/glass-card';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency } from '@/lib/finance';
import type { OnboardingData } from '@/lib/types';
import { computeFinance } from '@/lib/finance';

const SLIDER_CONFIG = [
  { key: 'salary', label: 'Salary', min: 0, max: 5000000, step: 50000, unit: '₹' },
  { key: 'inflation', label: 'Inflation Rate', min: 0, max: 15, step: 0.5, unit: '%' },
  { key: 'emi', label: 'Monthly EMIs', min: 0, max: 100000, step: 1000, unit: '₹' },
  { key: 'rent', label: 'Monthly Rent', min: 0, max: 100000, step: 500, unit: '₹' },
  { key: 'investment', label: 'Monthly Investment', min: 0, max: 200000, step: 1000, unit: '₹' },
  { key: 'retirementAge', label: 'Retirement Age', min: 40, max: 70, step: 1, unit: 'yrs' },
] as const;

type SimKey = typeof SLIDER_CONFIG[number]['key'];

export default function SimulatorPage() {
  const { onboarding } = useDashboard();
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const simData: OnboardingData | null = useMemo(() => {
    if (!onboarding) return null;
    return {
      ...onboarding,
      career: {
        ...onboarding.career,
        salary: overrides.salary ?? onboarding.career.salary,
      },
      expenses: {
        ...onboarding.expenses,
        rent: overrides.rent ?? onboarding.expenses.rent,
      },
      lifestyle: {
        ...onboarding.lifestyle,
        emis: overrides.emi ?? onboarding.lifestyle.emis,
      },
    };
  }, [onboarding, overrides]);

  const finance = useMemo(() => (simData ? computeFinance(simData) : null), [simData]);

  // Adjust future wealth with investment override
  const chartData = useMemo(() => {
    if (!finance) return [];
    const monthlyInvest = overrides.investment ?? Math.round(finance.monthlySavings * 0.6);
    const inflationRate = (overrides.inflation ?? finance.personalInflationIndex) / 100;
    const years = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30];
    let inv = finance.investmentValue;
    const annualInvest = monthlyInvest * 12;
    return years.map((y) => {
      inv = inv * 1.12 + annualInvest;
      const nw = inv + finance.monthlySavings * 12 * y;
      const pp = nw / Math.pow(1 + inflationRate, y);
      return { year: y, netWorth: Math.round(nw), investments: Math.round(inv), purchasingPower: Math.round(pp) };
    });
  }, [finance, overrides]);

  if (!finance) return <FinanceLoading />;

  const getVal = (key: SimKey): number => {
    if (overrides[key] !== undefined) return overrides[key];
    if (key === 'salary') return onboarding?.career.salary ?? 0;
    if (key === 'inflation') return finance.personalInflationIndex;
    if (key === 'emi') return onboarding?.lifestyle.emis ?? 0;
    if (key === 'rent') return onboarding?.expenses.rent ?? 0;
    if (key === 'investment') return Math.round(finance.monthlySavings * 0.6);
    if (key === 'retirementAge') return 60;
    return 0;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">What-If Simulator</h1>
        <p className="mt-1 text-sm text-muted-foreground">Adjust your financial variables and see your future update instantly.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sliders */}
        <GlassCard className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Adjust Variables</h3>
          </div>
          <div className="space-y-5">
            {SLIDER_CONFIG.map((s) => (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="font-semibold text-primary">
                    {s.unit === '₹' ? formatCurrency(getVal(s.key)) : `${getVal(s.key)}${s.unit}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={getVal(s.key)}
                  onChange={(e) => setOverrides((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
            ))}
            <button
              onClick={() => setOverrides({})}
              className="w-full rounded-xl glass px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-md"
            >
              Reset to Current
            </button>
          </div>
        </GlassCard>

        {/* Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Projected Impact</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="simNw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D5DF6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6D5DF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="simInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="simPp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => `${v}Y`} />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} labelFormatter={(l) => `Year ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#6D5DF6" strokeWidth={2.5} fill="url(#simNw)" animationDuration={600} />
                <Area type="monotone" dataKey="investments" name="Investments" stroke="#10B981" strokeWidth={2.5} fill="url(#simInv)" animationDuration={600} />
                <Area type="monotone" dataKey="purchasingPower" name="Purchasing Power" stroke="#06B6D4" strokeWidth={2.5} fill="url(#simPp)" animationDuration={600} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Live stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Monthly Income</p>
          <p className="mt-2 font-display text-xl font-bold">{formatCurrency(finance.monthlyIncome)}</p>
        </GlassCard>
        <GlassCard delay={0.05}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Monthly Savings</p>
          <p className="mt-2 font-display text-xl font-bold text-success">{formatCurrency(finance.monthlySavings)}</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Net Worth (30Y)</p>
          <p className="mt-2 font-display text-xl font-bold text-gradient">{formatCurrency(chartData[chartData.length - 1]?.netWorth ?? 0)}</p>
        </GlassCard>
        <GlassCard delay={0.15}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Purchasing Power (30Y)</p>
          <p className="mt-2 font-display text-xl font-bold text-accent">{formatCurrency(chartData[chartData.length - 1]?.purchasingPower ?? 0)}</p>
        </GlassCard>
      </div>
    </div>
  );
}
