'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, TrendingUp, Coins, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { GlassCard } from '@/components/dashboard/glass-card';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency } from '@/lib/finance';

const TABS = [
  { key: '5', label: '5 Years' },
  { key: '10', label: '10 Years' },
  { key: '20', label: '20 Years' },
  { key: '30', label: '30 Years' },
];

export default function FuturePage() {
  const { finance } = useDashboard();
  const [tab, setTab] = useState('10');
  if (!finance) return <FinanceLoading />;

  const selected = finance.futureWealth.find((w) => w.year === Number(tab)) ?? finance.futureWealth[1];

  // Build a year-by-year projection for the selected horizon
  const horizon = selected.year;
  const chartData = Array.from({ length: horizon + 1 }, (_, y) => {
    const annualSavings = finance.monthlySavings * 12;
    let inv = finance.investmentValue;
    for (let i = 0; i < y; i++) inv = inv * 1.12 + annualSavings;
    const savings = annualSavings * y;
    const nw = inv + savings;
    const pp = nw / Math.pow(1 + finance.personalInflationIndex / 100, y);
    return { year: y, savings: Math.round(savings), netWorth: Math.round(nw), investments: Math.round(inv), purchasingPower: Math.round(pp) };
  });

  const barData = [
    { name: 'Savings', value: selected.savings, fill: '#6D5DF6' },
    { name: 'Investments', value: selected.investments, fill: '#10B981' },
    { name: 'Net Worth', value: selected.netWorth, fill: '#06B6D4' },
    { name: 'Purchasing Power', value: selected.purchasingPower, fill: '#F59E0B' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Future Wealth Projection</h1>
        <p className="mt-1 text-sm text-muted-foreground">See how your wealth grows — and what inflation takes away.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl glass p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${tab === t.key ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab === t.key && (
              <motion.div layoutId="future-tab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="mb-2 flex items-center gap-2"><Gem className="h-4 w-4 text-primary" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Net Worth</p></div>
          <p className="font-display text-xl font-bold">{formatCurrency(selected.netWorth)}</p>
        </GlassCard>
        <GlassCard delay={0.05}>
          <div className="mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Investments</p></div>
          <p className="font-display text-xl font-bold text-success">{formatCurrency(selected.investments)}</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <div className="mb-2 flex items-center gap-2"><Coins className="h-4 w-4 text-secondary" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Savings</p></div>
          <p className="font-display text-xl font-bold">{formatCurrency(selected.savings)}</p>
        </GlassCard>
        <GlassCard delay={0.15}>
          <div className="mb-2 flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-warning" /><p className="text-xs uppercase tracking-wider text-muted-foreground">Purchasing Power</p></div>
          <p className="font-display text-xl font-bold text-warning">{formatCurrency(selected.purchasingPower)}</p>
        </GlassCard>
      </div>

      {/* Area chart */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Growth Over Time</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fwNw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D5DF6" stopOpacity={0.5} /><stop offset="100%" stopColor="#6D5DF6" stopOpacity={0} /></linearGradient>
                <linearGradient id="fwInv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                <linearGradient id="fwPp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} /><stop offset="100%" stopColor="#06B6D4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => `Y${v}`} />
              <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} labelFormatter={(l) => `Year ${l}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#6D5DF6" strokeWidth={2.5} fill="url(#fwNw)" animationDuration={1000} />
              <Area type="monotone" dataKey="investments" name="Investments" stroke="#10B981" strokeWidth={2.5} fill="url(#fwInv)" animationDuration={1200} />
              <Area type="monotone" dataKey="purchasingPower" name="Purchasing Power" stroke="#06B6D4" strokeWidth={2.5} fill="url(#fwPp)" animationDuration={1400} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Comparison bar */}
      <GlassCard delay={0.1}>
        <div className="mb-4 flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">At {selected.year} Years</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} cursor={{ fill: 'rgba(109,93,246,0.08)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1000}>
                {barData.map((d, i) => (<Cell key={i} fill={d.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
