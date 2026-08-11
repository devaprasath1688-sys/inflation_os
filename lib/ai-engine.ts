/**
 * Local rule-based financial response generator.
 * Used as a client-side fallback when the edge function is unavailable,
 * so the app works fully offline with no external API calls.
 *
 * Mirrors the logic in supabase/functions/ai-assistant/index.ts.
 * When an LLM API key is added in the future, the edge function will
 * handle LLM responses; this remains the offline safety net.
 */

import type { ComputedFinance } from './finance';
import type { OnboardingData, Goal } from './types';

export interface ChatContext {
  finance: ComputedFinance | null;
  onboarding: OnboardingData | null;
  goals: Goal[];
}

function fmt(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function generateLocalResponse(message: string, ctx: ChatContext): string {
  const q = message.toLowerCase();
  const f = ctx.finance;
  if (!f) return 'Please complete onboarding first so I can analyze your finances and give personalized advice.';

  const income = f.monthlyIncome;
  const expenses = f.monthlyExpenses;
  const savings = f.monthlySavings;
  const loans = ctx.onboarding?.lifestyle.loans ?? 0;
  const emis = ctx.onboarding?.lifestyle.emis ?? 0;
  const age = ctx.onboarding?.personal.age ?? 30;

  if (q.includes('car')) return carAdvice(savings, income, emis);
  if (q.includes('retire') || q.includes('retirement')) return retirementAdvice(age, expenses, savings, f.investmentValue, f.personalInflationIndex);
  if (q.includes('sip') || q.includes('invest') || q.includes('mutual fund') || q.includes('stock')) return investmentAdvice(savings, age, f.investmentValue, f.personalInflationIndex, income);
  if (q.includes('save') || q.includes('saving')) return savingsAdvice(income, expenses, savings, f.savingsRate);
  if (q.includes('inflation')) return inflationAdvice(f.personalInflationIndex, expenses);
  if (q.includes('house') || q.includes('home')) return houseAdvice(savings, income, f.netWorth, emis);
  if (q.includes('emergency')) return emergencyAdvice(f.emergencyFund.monthsCovered, expenses);
  if (q.includes('health') || q.includes('score')) return healthAdvice(f.financialHealthScore);
  if (q.includes('loan') || q.includes('debt') || q.includes('emi')) return debtAdvice(loans, emis, income, f.debtToIncomeRatio, savings);
  if (q.includes('goal') || q.includes('target')) return goalAdvice(ctx.goals, savings);
  if (q.includes('tax') || q.includes('ppf') || q.includes('nps') || q.includes('elss')) return taxAdvice(income, savings, age);
  if (q.includes('budget') || q.includes('expense') || q.includes('spend')) return budgetAdvice(income, expenses, f.expenseBreakdown);
  if (q.includes('net worth') || q.includes('wealth')) return wealthAdvice(f.netWorth, f.investmentValue, savings, f.personalInflationIndex);
  if (q.includes('insurance') || q.includes('term')) return insuranceAdvice(income, age);

  return generalAdvice(income, expenses, savings, f.financialHealthScore, f.personalInflationIndex, f.emergencyFund.monthsCovered, f.debtToIncomeRatio);
}

function carAdvice(savings: number, income: number, emis: number): string {
  const carBudget = income * 5;
  const downPayment = carBudget * 0.2;
  const monthlyForCar = Math.round(savings * 0.3);
  const monthsToDown = monthlyForCar > 0 ? Math.ceil(downPayment / monthlyForCar) : 0;
  const loanEmi = Math.round((carBudget - downPayment) * 0.9 / 60);
  const affordable = loanEmi + emis <= income * 0.4;
  return `Based on your income (${fmt(income)}/mo) and savings (${fmt(savings)}/mo):

• Recommended car budget: ${fmt(carBudget)}
• 20% down payment: ${fmt(downPayment)}
• Saving ${fmt(monthlyForCar)}/mo → down payment ready in ~${monthsToDown} months
• Loan EMI (5-year): ~${fmt(loanEmi)}/mo
• Total EMIs after car loan: ${fmt(loanEmi + emis)}/mo

${affordable ? 'This is affordable — total EMIs stay under 40% of income.' : 'This would push EMIs above 40% of income. Consider a cheaper car or larger down payment.'}`;
}

function retirementAdvice(age: number, expenses: number, savings: number, investments: number, inflation: number): string {
  const yearsToRetire = Math.max(1, 60 - age);
  const futureExpenses = expenses * Math.pow(1 + inflation / 100, yearsToRetire);
  const monthlyPension = Math.round(futureExpenses * 0.8);
  const corpusNeeded = monthlyPension * 12 * 25;
  const annualSavings = savings * 12;
  let projected = investments;
  for (let i = 0; i < yearsToRetire; i++) projected = projected * 1.12 + annualSavings;
  const gap = projected - corpusNeeded;
  return `Retirement projection (retiring at 60, ${yearsToRetire} years away):

• Inflation-adjusted expenses at 60: ${fmt(futureExpenses)}/mo
• Monthly pension needed: ${fmt(monthlyPension)}
• Corpus required (25 years): ${fmt(corpusNeeded)}
• Projected corpus: ${fmt(projected)}

${gap >= 0 ? `On track! Surplus of ${fmt(gap)}.` : `Gap of ${fmt(Math.abs(gap))}. Increase SIP or delay retirement by 3-5 years.`}`;
}

function investmentAdvice(savings: number, age: number, investments: number, inflation: number, income: number): string {
  const equityPct = Math.max(20, Math.min(70, 100 - age));
  const sipAmount = Math.round(savings * 0.6);
  const futureValue = sipAmount * 12 * (Math.pow(1.12, 10) - 1) / 0.12;
  return `Investment recommendation (age ${age}, savings ${fmt(savings)}/mo):

• Index Funds: ${Math.round(equityPct * 0.55)}% (~12% return)
• Debt Funds: ${Math.round(100 - equityPct - 25)}% (~7% return)
• Gold: 15% · PPF: 15% · Emergency Cash: 10%

Start with ${fmt(sipAmount)}/mo SIP, step up 10% yearly. In 10 years → ~${fmt(futureValue)}.

${investments < income * 3 ? 'Your investment base is low relative to income — increase allocation.' : 'Healthy investment base. Keep compounding!'}`;
}

function savingsAdvice(income: number, expenses: number, savings: number, rate: number): string {
  const ideal = income * 0.2;
  const extra = Math.max(0, ideal - savings);
  return `Savings analysis:

• Income: ${fmt(income)} · Expenses: ${fmt(expenses)} · Savings: ${fmt(savings)}/mo (${rate}%)
• Ideal target: ${fmt(ideal)}/mo (20%)

${rate < 20 ? `Save ${fmt(extra)} more per month to reach 20%. Cut discretionary expenses.` : 'Excellent — you\'re saving above 20%!'}

Allocation: 50% SIP · 30% emergency fund · 20% goals`;
}

function inflationAdvice(inflation: number, expenses: number): string {
  const future = expenses * Math.pow(1 + inflation / 100, 10);
  return `Your personal inflation index: ${inflation}% (${inflation > 5.5 ? 'above' : 'in line with'} national avg 5.5%).

• Current expenses: ${fmt(expenses)}/mo
• In 10 years: ~${fmt(future)}/mo

${inflation > 5.5 ? 'High inflation — reduce food, rent, fuel costs. Invest in equity & gold to beat it.' : 'Manageable — keep diversified investments.'}`;
}

function houseAdvice(savings: number, income: number, netWorth: number, emis: number): string {
  const budget = income * 60;
  const down = budget * 0.2;
  const monthly = Math.round(savings * 0.5);
  const years = monthly > 0 ? (down / monthly / 12).toFixed(1) : 'N/A';
  const loanEmi = Math.round((budget - down) * 0.009 / (1 - Math.pow(1.009, -240)));
  const total = loanEmi + emis;
  return `Home-buying analysis:

• Recommended budget: ${fmt(budget)}
• 20% down payment: ${fmt(down)}
• Saving ${fmt(monthly)}/mo → ready in ~${years} years
• Loan EMI (20yr): ${fmt(loanEmi)}/mo → Total EMIs: ${fmt(total)}/mo

${total <= income * 0.4 ? 'Affordable — within safe 40% limit.' : 'Risky — total EMIs exceed 40% of income.'}`;
}

function emergencyAdvice(months: number, expenses: number): string {
  const current = months * expenses;
  const target = expenses * 6;
  return `Emergency fund: ${months.toFixed(1)} months covered.

• Current: ${fmt(current)} · Target: ${fmt(target)}

${months < 3 ? 'Critical — below 3 months. Build this before investing.' : months < 6 ? `Save ${fmt((target - current) / 6)}/mo for 6 months to reach target.` : 'Healthy — redirect surplus to investments.'}`;
}

function healthAdvice(score: number): string {
  return `Financial health: ${score}/100 — ${score >= 75 ? 'Excellent' : score >= 50 ? 'Fair' : 'Needs Work'}.

${score >= 75 ? 'Keep maintaining discipline. Focus on tax optimization.' : score >= 50 ? 'Build emergency fund, increase SIP, get term insurance.' : 'Urgent: build 3-month emergency fund, cut discretionary spending, clear high-interest debt.'}`;
}

function debtAdvice(loans: number, emis: number, income: number, dti: number, savings: number): string {
  const payoff = savings > 0 && loans > 0 ? Math.ceil(loans / savings) : 0;
  return `Debt analysis:

• Total loans: ${fmt(loans)} · EMIs: ${fmt(emis)}/mo · DTI: ${dti}%

${dti > 40 ? 'Warning: EMIs exceed 40% of income. Prepay high-interest loans first.' : 'Debt level is manageable.'}

${payoff > 0 ? `Redirect surplus to prepay → debt-free in ~${payoff} months.` : ''}`;
}

function goalAdvice(goals: Goal[], savings: number): string {
  if (goals.length === 0) return `No goals set yet. You save ${fmt(savings)}/mo — allocate 20% to each goal for balanced progress.`;
  const lines = goals.map((g) => {
    const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
    const remaining = Math.max(0, g.target_amount - g.current_amount);
    return `• ${g.title}: ${fmt(g.current_amount)}/${fmt(g.target_amount)} (${pct}%) — ${fmt(remaining / 36)}/mo for 3yr completion`;
  });
  const total = goals.reduce((s, g) => s + Math.round(Math.max(0, g.target_amount - g.current_amount) / 36), 0);
  return `Goal progress:\n\n${lines.join('\n')}\n\nTotal: ${fmt(total)}/mo. ${total <= savings ? 'Fits your savings!' : 'Exceeds savings — extend timelines or increase income.'}`;
}

function taxAdvice(income: number, savings: number, age: number): string {
  const annual = income * 12;
  const ded80c = Math.min(150000, Math.round(savings * 12 * 0.4));
  const dedNps = Math.min(50000, Math.round(savings * 12 * 0.1));
  const saved = Math.round((ded80c + dedNps) * 0.3);
  return `Tax-saving (old regime):

• 80C (PPF, ELSS, NPS): ${fmt(ded80c)}/yr → ₹1.5L deduction
• 80CCD(1B) NPS: ${fmt(dedNps)}/yr → ₹50K deduction
• Tax saved: ~${fmt(saved)}/yr

Start ELSS SIP, max out PPF, open NPS. At age ${age}, equity-linked savings are ideal.`;
}

function budgetAdvice(income: number, expenses: number, breakdown?: { name: string; value: number }[]): string {
  const ratio = income > 0 ? Math.round((expenses / income) * 100) : 0;
  let cats = '';
  if (breakdown && breakdown.length > 0) {
    const top = [...breakdown].sort((a, b) => b.value - a.value).slice(0, 3);
    cats = `\n\nTop categories:\n${top.map((c) => `• ${c.name}: ${fmt(c.value)}/mo`).join('\n')}`;
  }
  return `Budget: ${fmt(income)} income · ${fmt(expenses)} expenses (${ratio}%).

${ratio > 80 ? 'Critical: over 80% spent. Cut discretionary by 30%.' : ratio > 60 ? 'Caution: follow 50/30/20 rule.' : 'Good spending control.'}

50% needs: ${fmt(income * 0.5)} · 30% wants: ${fmt(income * 0.3)} · 20% savings: ${fmt(income * 0.2)}${cats}`;
}

function wealthAdvice(netWorth: number, investments: number, savings: number, inflation: number): string {
  const pct = netWorth > 0 ? Math.round((investments / netWorth) * 100) : 0;
  const fiveYr = investments * Math.pow(1.12, 5) + savings * 12 * 5;
  return `Wealth snapshot:

• Net worth: ${fmt(netWorth)} · Investments: ${fmt(investments)} (${pct}%)
• 5-year projection: ${fmt(fiveYr)}

${pct < 40 ? 'Low investment ratio — move idle cash to investments.' : 'Balanced allocation. Keep growing SIP.'}

At ${inflation}% inflation, ₹100 today → ${fmt(100 / Math.pow(1 + inflation / 100, 10))} in 10 years. Invest to preserve purchasing power.`;
}

function insuranceAdvice(income: number, age: number): string {
  const cover = income * 12 * 15;
  const premium = Math.round(cover * 0.003);
  return `Insurance assessment:

• Term cover needed: ${fmt(cover)} (15x annual income)
• Estimated premium: ~${fmt(premium)}/yr (age ${age})

Get term insurance early to lock in low rates. Also consider health insurance (₹5-10L family floater). Avoid ULIPs — they mix insurance and investment poorly.`;
}

function generalAdvice(income: number, expenses: number, savings: number, score: number, inflation: number, emMonths: number, dti: number): string {
  const priorities: string[] = [];
  if (emMonths < 3) priorities.push('Build a 3-month emergency fund immediately');
  else if (emMonths < 6) priorities.push('Top up emergency fund to 6 months');
  if (dti > 40) priorities.push('Reduce debt — EMIs exceed 40% of income');
  if (savings < income * 0.1) priorities.push('Increase savings to at least 10% of income');
  if (score < 50) priorities.push(`Improve health score (currently ${score}/100)`);
  if (priorities.length === 0) priorities.push('Start a SIP to grow long-term wealth');
  if (priorities.length < 3) priorities.push('Get term insurance if you have dependents');
  if (priorities.length < 3) priorities.push(`Track personal inflation (${inflation}%) quarterly`);

  return `Financial summary:

• Income: ${fmt(income)}/mo · Expenses: ${fmt(expenses)}/mo · Savings: ${fmt(savings)}/mo
• Health: ${score}/100 · Inflation: ${inflation}% · DTI: ${dti}%

Top priorities:
${priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Ask me about buying a house, retirement, SIP, loans, insurance, or inflation!`;
}
