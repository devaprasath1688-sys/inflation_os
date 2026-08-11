'use client';

import { motion } from 'framer-motion';
import {
  Wallet, TrendingDown, PiggyBank, TrendingUp, Gem, HeartPulse,
  Sparkles, ArrowUpRight, ArrowDownRight, AlertTriangle, Lightbulb, Info,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, AreaChart, Area, CartesianGrid,
} from 'recharts';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { GlassCard } from '@/components/dashboard/glass-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { InflationGauge } from '@/components/dashboard/inflation-gauge';
import { HealthScore } from '@/components/dashboard/health-score';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency } from '@/lib/finance';

const PIE_COLORS = ['#6D5DF6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316'];

const PRIORITY_STYLES = {
  high: { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertTriangle },
  medium: { bg: 'bg-warning/10', text: 'text-warning', icon: Info },
  low: { bg: 'bg-success/10', text: 'text-success', icon: Lightbulb },
};

export default function DashboardOverview() {
  const { profile, finance } = useDashboard();

  if (!finance) {
    return <FinanceLoading />;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = profile?.display_name || 'there';

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glow-border relative overflow-hidden rounded-3xl glass-strong p-6 shadow-xl sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {greeting},
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl font-bold sm:text-4xl"
            >
              Welcome back, <span className="text-gradient">{name}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-muted-foreground sm:text-base"
            >
              Here is your financial status for today. Your net worth is{' '}
              <span className="font-semibold text-foreground">{formatCurrency(finance.netWorth)}</span>.
            </motion.p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl glass px-5 py-4">
            <HeartPulse className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Health Score</p>
              <p className="font-display text-2xl font-bold text-gradient">{finance.financialHealthScore}<span className="text-sm text-muted-foreground">/100</span></p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Monthly Income" value={finance.monthlyIncome} icon={Wallet} isCurrency color="from-primary to-secondary" delay={0.05} trend={{ value: 5, label: 'vs last month' }} />
        <StatCard label="Monthly Expenses" value={finance.monthlyExpenses} icon={TrendingDown} isCurrency color="from-destructive to-warning" delay={0.1} />
        <StatCard label="Monthly Savings" value={finance.monthlySavings} icon={PiggyBank} isCurrency color="from-success to-accent" delay={0.15} />
        <StatCard label="Investment Value" value={finance.investmentValue} icon={TrendingUp} isCurrency color="from-secondary to-accent" delay={0.2} />
        <StatCard label="Net Worth" value={finance.netWorth} icon={Gem} isCurrency color="from-accent to-primary" delay={0.25} />
        <StatCard label="Financial Health" value={finance.financialHealthScore} icon={HeartPulse} suffix="/100" color="from-primary to-success" delay={0.3} />
      </div>

      {/* Key ratios row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard delay={0.05}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Savings Rate</p>
          <p className="mt-2 font-display text-xl font-bold text-success">{finance.savingsRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">of monthly income</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Expense Ratio</p>
          <p className="mt-2 font-display text-xl font-bold">{finance.expenseRatio}%</p>
          <p className="mt-1 text-xs text-muted-foreground">of monthly income</p>
        </GlassCard>
        <GlassCard delay={0.15}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Debt-to-Income</p>
          <p className="mt-2 font-display text-xl font-bold {finance.debtToIncomeRatio > 40 ? 'text-destructive' : 'text-success'}">{finance.debtToIncomeRatio}%</p>
          <p className="mt-1 text-xs text-muted-foreground">EMIs vs income</p>
        </GlassCard>
        <GlassCard delay={0.2}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">FI Score</p>
          <p className="mt-2 font-display text-xl font-bold text-gradient">{finance.financialIndependenceScore}/100</p>
          <p className="mt-1 text-xs text-muted-foreground">financial independence</p>
        </GlassCard>
      </div>

      {/* Inflation gauge + Health score */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Personal Inflation Index</h3>
          </div>
          <div className="flex flex-col items-center">
            <InflationGauge value={finance.personalInflationIndex} />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {finance.personalInflationIndex > 5.5
                ? 'Your lifestyle inflation is higher than the national average. Food and rent are your biggest drivers.'
                : 'Your lifestyle inflation is in line with the national average. Keep monitoring your discretionary spending.'}
            </p>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div className="mb-4 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Financial Health Score</h3>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            <HealthScore value={finance.financialHealthScore} />
            <div className="space-y-3 text-sm">
              <p className="font-medium text-muted-foreground">AI Analysis</p>
              <div>
                <p className="font-semibold text-success">Strengths</p>
                <p className="text-xs text-muted-foreground">
                  {finance.monthlySavings > 0 ? 'Positive savings rate' : 'Build savings'} ·{' '}
                  {finance.investmentValue > 0 ? 'Diversified investments' : 'Start investing'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-destructive">Watch out</p>
                <p className="text-xs text-muted-foreground">
                  {finance.emergencyFund.monthsCovered < 6 ? 'Emergency fund below 6 months' : 'Emergency fund healthy'} ·{' '}
                  {finance.personalInflationIndex > 5.5 ? 'High personal inflation' : 'Inflation under control'}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Spending pie + Cash flow bar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Spending Analysis</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finance.expenseBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  animationDuration={1200}
                >
                  {finance.expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Monthly Cash Flow</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finance.cashFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v)}
                  cursor={{ fill: 'rgba(109,93,246,0.08)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1200}>
                  {finance.cashFlow.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* AI Insights */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">AI Insights</h3>
          <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{finance.aiInsights.length} recommendations</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {finance.aiInsights.map((insight, i) => {
            const style = PRIORITY_STYLES[insight.priority];
            const Icon = style.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl ${style.bg} p-4`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${style.text}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>{insight.priority}</span>
                </div>
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{insight.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Investment advisor preview */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Investment Advisor</h3>
          <span className="ml-auto text-xs text-muted-foreground">AI-recommended allocation</span>
        </div>
        <div className="space-y-3">
          {finance.investmentAllocation.map((alloc, i) => (
            <div key={alloc.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{alloc.name}</span>
                <span className="font-semibold text-primary">{alloc.pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${alloc.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{alloc.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Future wealth preview */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Future Wealth Projection</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={finance.futureWealth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D5DF6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6D5DF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ppGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => `${v}Y`} />
              <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                formatter={(v: number) => formatCurrency(v)}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#6D5DF6" strokeWidth={2.5} fill="url(#netWorthGrad)" animationDuration={1500} />
              <Area type="monotone" dataKey="purchasingPower" name="Purchasing Power" stroke="#06B6D4" strokeWidth={2.5} fill="url(#ppGrad)" animationDuration={1800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
