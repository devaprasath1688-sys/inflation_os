'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { GlassCard } from '@/components/dashboard/glass-card';
import { ProgressBar } from '@/components/dashboard/progress-bar';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency, formatCurrencyFull } from '@/lib/finance';

export default function EmergencyPage() {
  const { finance } = useDashboard();
  if (!finance) return <FinanceLoading />;

  const ef = finance.emergencyFund;
  const status = ef.monthsCovered >= 6 ? 'healthy' : ef.monthsCovered >= 3 ? 'fair' : 'critical';
  const statusConfig = {
    healthy: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2, label: 'Healthy' },
    fair: { color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, label: 'Needs Attention' },
    critical: { color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle, label: 'Critical' },
  };
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  const shortfall = Math.max(0, ef.recommended - ef.current);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Emergency Fund</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your financial safety net — aim for 6 months of expenses.</p>
      </div>

      {/* Status banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-3 rounded-2xl ${cfg.bg} p-4`}>
        <Icon className={`h-6 w-6 ${cfg.color}`} />
        <div>
          <p className={`font-semibold ${cfg.color}`}>{cfg.label}</p>
          <p className="text-sm text-muted-foreground">
            {status === 'healthy'
              ? 'Your emergency fund covers 6+ months. You are well protected.'
              : `You need ${formatCurrency(shortfall)} more to reach 6 months of coverage.`}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Fund</p>
          <p className="mt-2 font-display text-2xl font-bold">{formatCurrency(ef.current)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatCurrencyFull(ef.current)}</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended (6 months)</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary">{formatCurrency(ef.recommended)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatCurrencyFull(ef.recommended)}</p>
        </GlassCard>
        <GlassCard delay={0.2}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Months Covered</p>
          <p className="mt-2 font-display text-2xl font-bold text-gradient">{ef.monthsCovered}</p>
          <p className="mt-1 text-xs text-muted-foreground">of 6 target months</p>
        </GlassCard>
      </div>

      {/* Progress */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Progress to Goal</h3>
          <span className="ml-auto font-display text-2xl font-bold text-gradient">{ef.pct.toFixed(0)}%</span>
        </div>
        <ProgressBar value={ef.pct} className="h-4" />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(ef.current)}</span>
          <span>{formatCurrency(ef.recommended)}</span>
        </div>
      </GlassCard>

      {/* Recommendation */}
      <GlassCard delay={0.1}>
        <h3 className="mb-3 font-display text-lg font-semibold">AI Recommendation</h3>
        <p className="text-sm text-muted-foreground">
          {status === 'healthy'
            ? 'Your emergency fund is healthy. Consider directing surplus savings toward investments and long-term goals. Keep this fund in a liquid account (savings or liquid mutual fund) for instant access.'
            : `To reach a 6-month buffer, save ${formatCurrency(Math.round(shortfall / 12))}/month for the next 12 months. Park this in a high-yield savings account or liquid mutual fund — not in investments that can drop in value when you need them most.`}
        </p>
      </GlassCard>
    </div>
  );
}
