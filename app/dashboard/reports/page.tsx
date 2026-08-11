'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, Printer, FileSpreadsheet, Check, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { FinanceLoading } from '@/components/dashboard/loading-finance';
import { formatCurrency } from '@/lib/finance';

export default function ReportsPage() {
  const { finance, profile } = useDashboard();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);
  if (!finance) return <FinanceLoading />;

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      if (type === 'print') {
        window.print();
        setExported(type);
        setTimeout(() => setExported(null), 2000);
        return;
      }

      if (type === 'share') {
        if (navigator.share) {
          await navigator.share({
            title: 'InflationOS Financial Report',
            text: `My financial health score is ${finance.financialHealthScore}/100. Net worth: ${formatCurrency(finance.netWorth)}.`,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(`My InflationOS financial report — Health Score: ${finance.financialHealthScore}/100, Net Worth: ${formatCurrency(finance.netWorth)}`);
        }
        setExported(type);
        setTimeout(() => setExported(null), 2000);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        } as Record<string, string>,
        body: JSON.stringify({
          format: type === 'pdf' ? 'pdf' : 'excel',
          profile: { name: profile?.display_name ?? 'User', date: new Date().toLocaleDateString('en-IN') },
          finance: {
            monthlyIncome: finance.monthlyIncome,
            monthlyExpenses: finance.monthlyExpenses,
            monthlySavings: finance.monthlySavings,
            investmentValue: finance.investmentValue,
            netWorth: finance.netWorth,
            financialHealthScore: finance.financialHealthScore,
            personalInflationIndex: finance.personalInflationIndex,
            savingsRate: finance.savingsRate,
            expenseRatio: finance.expenseRatio,
            debtToIncomeRatio: finance.debtToIncomeRatio,
            emergencyFund: finance.emergencyFund,
            retirement: finance.retirement,
            futureWealth: finance.futureWealth,
            aiInsights: finance.aiInsights,
            investmentAllocation: finance.investmentAllocation,
          },
        }),
      });

      if (!response.ok) throw new Error('Report generation failed');

      if (type === 'excel') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inflationos-report-${(profile?.display_name ?? 'user').replace(/\s/g, '-').toLowerCase()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const html = await response.text();
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(html);
          w.document.close();
        }
      }

      setExported(type);
      setTimeout(() => setExported(null), 2000);
    } catch {
      // Fallback: generate a simple CSV client-side
      if (type === 'excel') {
        const rows = [
          'Category,Metric,Value',
          `Profile,Name,${profile?.display_name ?? 'User'}`,
          `Income,Monthly Income,${finance.monthlyIncome}`,
          `Expenses,Monthly Expenses,${finance.monthlyExpenses}`,
          `Savings,Monthly Savings,${finance.monthlySavings}`,
          `Wealth,Net Worth,${finance.netWorth}`,
          `Health,Score,${finance.financialHealthScore}`,
          `Inflation,Personal Index,${finance.personalInflationIndex}%`,
        ];
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inflationos-report.csv';
        a.click();
        URL.revokeObjectURL(url);
        setExported(type);
        setTimeout(() => setExported(null), 2000);
      }
    } finally {
      setExporting(null);
    }
  };

  const reportSections = [
    { label: 'Monthly Income', value: formatCurrency(finance.monthlyIncome) },
    { label: 'Monthly Expenses', value: formatCurrency(finance.monthlyExpenses) },
    { label: 'Monthly Savings', value: formatCurrency(finance.monthlySavings) },
    { label: 'Investment Value', value: formatCurrency(finance.investmentValue) },
    { label: 'Net Worth', value: formatCurrency(finance.netWorth) },
    { label: 'Financial Health Score', value: `${finance.financialHealthScore}/100` },
    { label: 'Personal Inflation Index', value: `${finance.personalInflationIndex}%` },
    { label: 'Savings Rate', value: `${finance.savingsRate}%` },
    { label: 'Expense Ratio', value: `${finance.expenseRatio}%` },
    { label: 'Debt-to-Income Ratio', value: `${finance.debtToIncomeRatio}%` },
    { label: 'Emergency Fund', value: `${finance.emergencyFund.monthsCovered} months` },
    { label: 'Retirement Corpus', value: formatCurrency(finance.retirement.corpus) },
    { label: 'Future Net Worth (10Y)', value: formatCurrency(finance.futureWealth[1].netWorth) },
    { label: 'FI Score', value: `${finance.financialIndependenceScore}/100` },
  ];

  const exportButtons = [
    { type: 'pdf', label: 'Download PDF', icon: FileText, color: 'from-destructive to-warning' },
    { type: 'excel', label: 'Download Excel', icon: FileSpreadsheet, color: 'from-success to-accent' },
    { type: 'share', label: 'Share Report', icon: Share2, color: 'from-primary to-secondary' },
    { type: 'print', label: 'Print Report', icon: Printer, color: 'from-secondary to-accent' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate and export premium financial reports.</p>
      </div>

      {/* Export buttons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {exportButtons.map((btn, i) => (
          <motion.button
            key={btn.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleExport(btn.type)}
            disabled={exporting === btn.type}
            className={`group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${btn.color} px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60`}
          >
            {exporting === btn.type ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : exported === btn.type ? (
              <Check className="h-4 w-4" />
            ) : (
              <btn.icon className="h-4 w-4" />
            )}
            {exported === btn.type ? 'Done!' : exporting === btn.type ? 'Generating...' : btn.label}
          </motion.button>
        ))}
      </div>

      {/* Report preview */}
      <GlassCard>
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">Financial Intelligence Report</h3>
              <p className="text-xs text-muted-foreground">{profile?.display_name} · {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Generated</span>
        </div>

        <div className="space-y-2">
          {reportSections.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl glass px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">{section.label}</span>
              <span className="font-semibold">{section.value}</span>
            </motion.div>
          ))}
        </div>

        {/* AI Insights summary */}
        <div className="mt-6 rounded-2xl glass p-4">
          <p className="mb-2 text-sm font-semibold">AI Summary</p>
          <p className="text-xs text-muted-foreground">
            Your financial health score is {finance.financialHealthScore}/100. Your personal inflation index of {finance.personalInflationIndex}% is{' '}
            {finance.personalInflationIndex > 5.5 ? 'above' : 'in line with'} the national average. Focus on{' '}
            {finance.emergencyFund.monthsCovered < 6 ? 'building your emergency fund' : 'growing your investments'}
            {' '}and {finance.monthlySavings > 0 ? 'maintaining your savings rate' : 'increasing your savings'}.
          </p>
        </div>

        {/* Investment allocation in report */}
        <div className="mt-4 rounded-2xl glass p-4">
          <p className="mb-3 text-sm font-semibold">Investment Allocation</p>
          <div className="space-y-2">
            {finance.investmentAllocation.map((a, i) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <span>{a.name}</span>
                <span className="font-semibold text-primary">{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
