import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReportRequest {
  format: "pdf" | "excel";
  profile: {
    name: string;
    date: string;
  };
  finance: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    investmentValue: number;
    netWorth: number;
    financialHealthScore: number;
    personalInflationIndex: number;
    savingsRate: number;
    expenseRatio: number;
    debtToIncomeRatio: number;
    emergencyFund: { current: number; recommended: number; monthsCovered: number };
    retirement: { corpus: number; monthlyPension: number; inflationAdjustedExpenses: number; gap: number };
    futureWealth: { year: number; savings: number; netWorth: number; investments: number; purchasingPower: number }[];
    aiInsights: { title: string; desc: string; priority: string }[];
    investmentAllocation: { name: string; pct: number; desc: string }[];
  };
}

/**
 * Report Generator Edge Function
 *
 * Generates downloadable financial reports. For PDF, returns an HTML
 * document with print-optimized styling that the browser can save as PDF.
 * For Excel, returns a CSV file with all financial data formatted for
 * spreadsheet import.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { format, profile, finance } = (await req.json()) as ReportRequest;

    if (format === "excel") {
      return generateExcel(profile, finance);
    }

    return generatePDF(profile, finance);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function generatePDF(profile: ReportRequest["profile"], finance: ReportRequest["finance"]): Response {
  const insightsHtml = finance.aiInsights.map((i) => `<li style="margin-bottom:8px;"><strong style="color:${i.priority === 'high' ? '#ef4444' : i.priority === 'medium' ? '#f59e0b' : '#10b981'}">${i.priority.toUpperCase()}</strong> — ${i.title}: ${i.desc}</li>`).join("");
  const allocHtml = finance.investmentAllocation.map((a) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${a.name}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${a.pct}%</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:12px;color:#666;">${a.desc}</td></tr>`).join("");
  const futureHtml = finance.futureWealth.map((f) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">Year ${f.year}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">₹${f.netWorth.toLocaleString('en-IN')}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">₹${f.investments.toLocaleString('en-IN')}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">₹${f.purchasingPower.toLocaleString('en-IN')}</td></tr>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>InflationOS Financial Report — ${profile.name}</title>
<style>
  body { font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a2e; }
  .header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #6D5DF6; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6D5DF6, #8B5CF6); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
  h1 { font-size: 24px; margin: 0; }
  h2 { font-size: 18px; color: #6D5DF6; margin-top: 30px; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .card { background: #f8f9ff; border-radius: 12px; padding: 16px; border: 1px solid #e0e0ee; }
  .card-label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
  .card-value { font-size: 22px; font-weight: bold; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { text-align: left; padding: 8px 12px; background: #f0f0ff; font-size: 12px; text-transform: uppercase; color: #666; }
  .insights { background: #f8f9ff; border-radius: 12px; padding: 16px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">I</div>
    <div>
      <h1>InflationOS Financial Intelligence Report</h1>
      <p style="margin:4px 0 0 0;color:#666;font-size:14px;">${profile.name} · ${profile.date}</p>
    </div>
  </div>

  <h2>Financial Summary</h2>
  <div class="grid">
    <div class="card"><div class="card-label">Monthly Income</div><div class="card-value">₹${finance.monthlyIncome.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Monthly Expenses</div><div class="card-value">₹${finance.monthlyExpenses.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Monthly Savings</div><div class="card-value" style="color:#10b981;">₹${finance.monthlySavings.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Net Worth</div><div class="card-value">₹${finance.netWorth.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Investment Value</div><div class="card-value">₹${finance.investmentValue.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Health Score</div><div class="card-value">${finance.financialHealthScore}/100</div></div>
  </div>

  <h2>Key Ratios</h2>
  <div class="grid">
    <div class="card"><div class="card-label">Savings Rate</div><div class="card-value">${finance.savingsRate}%</div></div>
    <div class="card"><div class="card-label">Expense Ratio</div><div class="card-value">${finance.expenseRatio}%</div></div>
    <div class="card"><div class="card-label">Debt-to-Income</div><div class="card-value">${finance.debtToIncomeRatio}%</div></div>
    <div class="card"><div class="card-label">Personal Inflation Index</div><div class="card-value">${finance.personalInflationIndex}%</div></div>
  </div>

  <h2>Emergency Fund</h2>
  <div class="grid">
    <div class="card"><div class="card-label">Current Fund</div><div class="card-value">₹${finance.emergencyFund.current.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Recommended</div><div class="card-value">₹${finance.emergencyFund.recommended.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Months Covered</div><div class="card-value">${finance.emergencyFund.monthsCovered}</div></div>
  </div>

  <h2>Retirement Projection</h2>
  <div class="grid">
    <div class="card"><div class="card-label">Projected Corpus</div><div class="card-value">₹${finance.retirement.corpus.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Monthly Pension Needed</div><div class="card-value">₹${finance.retirement.monthlyPension.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Inflation-Adjusted Expenses</div><div class="card-value">₹${finance.retirement.inflationAdjustedExpenses.toLocaleString('en-IN')}</div></div>
    <div class="card"><div class="card-label">Gap</div><div class="card-value" style="color:${finance.retirement.gap >= 0 ? '#10b981' : '#ef4444'};">${finance.retirement.gap >= 0 ? '+' : ''}₹${finance.retirement.gap.toLocaleString('en-IN')}</div></div>
  </div>

  <h2>Future Wealth Projection</h2>
  <table>
    <tr><th>Horizon</th><th>Net Worth</th><th>Investments</th><th>Purchasing Power</th></tr>
    ${futureHtml}
  </table>

  <h2>Investment Allocation</h2>
  <table>
    <tr><th>Asset</th><th>Allocation</th><th>Rationale</th></tr>
    ${allocHtml}
  </table>

  <h2>AI Recommendations</h2>
  <div class="insights">
    <ul style="padding-left:20px;margin:0;">${insightsHtml}</ul>
  </div>

  <div class="footer">
    Generated by InflationOS — Know Your Future Before Inflation Changes It.<br>
    This report is for informational purposes only and does not constitute financial advice.
  </div>

  <div class="no-print" style="text-align:center;margin-top:20px;">
    <button onclick="window.print()" style="background:#6D5DF6;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;">Print / Save as PDF</button>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html",
      "Content-Disposition": `inline; filename="inflationos-report-${profile.name.replace(/\s/g, '-').toLowerCase()}.html"`,
    },
  });
}

function generateExcel(profile: ReportRequest["profile"], finance: ReportRequest["finance"]): Response {
  const rows: string[] = [];
  rows.push("Category,Metric,Value");
  rows.push(`Profile,Name,${profile.name}`);
  rows.push(`Profile,Date,${profile.date}`);
  rows.push(`Income,Monthly Income,${finance.monthlyIncome}`);
  rows.push(`Expenses,Monthly Expenses,${finance.monthlyExpenses}`);
  rows.push(`Savings,Monthly Savings,${finance.monthlySavings}`);
  rows.push(`Wealth,Net Worth,${finance.netWorth}`);
  rows.push(`Wealth,Investment Value,${finance.investmentValue}`);
  rows.push(`Health,Financial Health Score,${finance.financialHealthScore}`);
  rows.push(`Ratios,Savings Rate,${finance.savingsRate}%`);
  rows.push(`Ratios,Expense Ratio,${finance.expenseRatio}%`);
  rows.push(`Ratios,Debt-to-Income,${finance.debtToIncomeRatio}%`);
  rows.push(`Inflation,Personal Inflation Index,${finance.personalInflationIndex}%`);
  rows.push(`Emergency Fund,Current,${finance.emergencyFund.current}`);
  rows.push(`Emergency Fund,Recommended,${finance.emergencyFund.recommended}`);
  rows.push(`Emergency Fund,Months Covered,${finance.emergencyFund.monthsCovered}`);
  rows.push(`Retirement,Projected Corpus,${finance.retirement.corpus}`);
  rows.push(`Retirement,Monthly Pension,${finance.retirement.monthlyPension}`);
  rows.push(`Retirement,Inflation-Adjusted Expenses,${finance.retirement.inflationAdjustedExpenses}`);
  rows.push(`Retirement,Gap,${finance.retirement.gap}`);

  for (const fw of finance.futureWealth) {
    rows.push(`Future Year ${fw.year},Net Worth,${fw.netWorth}`);
    rows.push(`Future Year ${fw.year},Investments,${fw.investments}`);
    rows.push(`Future Year ${fw.year},Purchasing Power,${fw.purchasingPower}`);
  }

  for (const alloc of finance.investmentAllocation) {
    rows.push(`Allocation,${alloc.name},${alloc.pct}%`);
  }

  for (const insight of finance.aiInsights) {
    rows.push(`AI Insight (${insight.priority}),${insight.title},${insight.desc.replace(/,/g, ';')}`);
  }

  const csv = rows.join("\n");

  return new Response(csv, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="inflationos-report-${profile.name.replace(/\s/g, '-').toLowerCase()}.csv"`,
    },
  });
}
