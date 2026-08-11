'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { GlassCard } from '@/components/dashboard/glass-card';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency } from '@/lib/finance';

const PIE_COLORS = ['#6D5DF6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

export default function InvestmentsPage() {
  const { finance } = useDashboard();
  if (!finance) return <FinanceLoading />;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Investment Advisor</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-powered allocation tailored to your profile and risk tolerance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Investments</p>
          <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(finance.investmentValue)}</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Monthly SIP Capacity</p>
          <p className="mt-2 font-display text-2xl font-bold text-success">{formatCurrency(Math.round(finance.monthlySavings * 0.6))}</p>
        </GlassCard>
        <GlassCard delay={0.2}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Projected (10Y)</p>
          <p className="mt-2 font-display text-2xl font-bold text-gradient">{formatCurrency(finance.futureWealth[1].investments)}</p>
        </GlassCard>
      </div>

      {/* Allocation pie */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Recommended Allocation</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={finance.investmentAllocation} dataKey="pct" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} animationDuration={1200}>
                  {finance.investmentAllocation.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Why This Allocation?</h3>
          </div>
          <div className="space-y-4">
            {finance.investmentAllocation.map((alloc, i) => (
              <motion.div key={alloc.name} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl glass p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="font-semibold">{alloc.name}</p>
                  <span className="font-bold text-primary">{alloc.pct}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{alloc.desc}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
