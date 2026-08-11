'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Sparkles, TrendingDown, Scissors } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { GlassCard } from '@/components/dashboard/glass-card';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency } from '@/lib/finance';

const PIE_COLORS = ['#6D5DF6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#A855F7', '#22D3EE', '#84CC16', '#FB7185'];

const PRIORITY_STYLES = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-success/10 text-success',
};

export default function SpendingPage() {
  const { finance } = useDashboard();
  if (!finance) return <FinanceLoading />;

  const totalSavings = finance.expenseOptimization.reduce((s, e) => s + e.potentialSavings, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Spending Analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">Understand where your money goes and how to optimize it.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard delay={0}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Monthly Expenses</p>
          <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(finance.monthlyExpenses)}</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Categories</p>
          <p className="mt-2 font-display text-2xl font-bold">{finance.expenseBreakdown.length}</p>
        </GlassCard>
        <GlassCard delay={0.2}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Potential Savings</p>
          <p className="mt-2 font-display text-2xl font-bold text-success">{formatCurrency(totalSavings)}/mo</p>
        </GlassCard>
      </div>

      {/* Pie chart */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Expenses by Category</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={finance.expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} paddingAngle={2} animationDuration={1200} label={(e) => `${e.name}`}>
                {finance.expenseBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Category bars */}
      <GlassCard delay={0.1}>
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Category Breakdown</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finance.expenseBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" width={80} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} cursor={{ fill: 'rgba(109,93,246,0.08)' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={1200}>
                {finance.expenseBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Expense optimizer */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Expense Optimizer</h3>
          <span className="ml-auto rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">Save {formatCurrency(totalSavings)}/mo</span>
        </div>
        <div className="space-y-3">
          {finance.expenseOptimization.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Your spending looks optimized. No major cuts needed.</p>
          ) : (
            finance.expenseOptimization.map((opt, i) => (
              <motion.div key={opt.category} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4 rounded-2xl glass p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{opt.category}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[opt.priority]}`}>{opt.priority}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{opt.lifestyleImpact}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-success">{formatCurrency(opt.potentialSavings)}</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
