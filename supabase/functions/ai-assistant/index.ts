import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FinancialContext {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  monthlySavings?: number;
  netWorth?: number;
  healthScore?: number;
  inflationIndex?: number;
  investmentValue?: number;
  emergencyFundMonths?: number;
  age?: number;
  loans?: number;
  emis?: number;
  savingsRate?: number;
  debtToIncomeRatio?: number;
  goals?: { title: string; targetAmount: number; currentAmount: number; deadline?: string | null }[];
  expenseBreakdown?: { name: string; value: number }[];
}

interface ChatRequest {
  message: string;
  financialContext?: FinancialContext;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, financialContext } = (await req.json()) as ChatRequest;

    if (!message || typeof message !== "string") {
      return jsonResponse({ error: "Message is required" }, 400);
    }

    const ctx = financialContext ?? {};
    const llmKey = Deno.env.get("OPENAI_API_KEY");

    if (llmKey) {
      try {
        const llmResponse = await callOpenAI(message, ctx, llmKey);
        if (llmResponse) {
          return jsonResponse({ response: llmResponse, source: "llm" });
        }
      } catch (err) {
        console.error("OpenAI call failed, falling back to rule-based:", err.message);
      }
    }

    const response = generateResponse(message, ctx);
    return jsonResponse({ response, source: "rule-based" });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── OpenAI integration ─────────────────────────────────────────────────

async function callOpenAI(
  message: string,
  ctx: FinancialContext,
  apiKey: string,
): Promise<string | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(ctx) },
        { role: "user", content: message },
      ],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim().length > 0 ? content.trim() : null;
}

// ── System prompt builder ──────────────────────────────────────────────

function buildSystemPrompt(ctx?: FinancialContext): string {
  let prompt = "You are InflationOS AI, a financial intelligence assistant. You help users understand inflation, savings, investments, retirement, and personal finance. Be concise, actionable, and personalized. Always reference the user's actual numbers when available. Use Indian Rupee (₹) formatting. Keep responses under 250 words unless the user asks for detail.";

  if (ctx) {
    prompt += `\n\nUser Financial Context:\n`;
    if (ctx.monthlyIncome) prompt += `- Monthly Income: ₹${ctx.monthlyIncome.toLocaleString()}\n`;
    if (ctx.monthlyExpenses) prompt += `- Monthly Expenses: ₹${ctx.monthlyExpenses.toLocaleString()}\n`;
    if (ctx.monthlySavings !== undefined) prompt += `- Monthly Savings: ₹${ctx.monthlySavings.toLocaleString()}\n`;
    if (ctx.netWorth) prompt += `- Net Worth: ₹${ctx.netWorth.toLocaleString()}\n`;
    if (ctx.healthScore) prompt += `- Financial Health Score: ${ctx.healthScore}/100\n`;
    if (ctx.inflationIndex) prompt += `- Personal Inflation Index: ${ctx.inflationIndex}%\n`;
    if (ctx.investmentValue) prompt += `- Investment Value: ₹${ctx.investmentValue.toLocaleString()}\n`;
    if (ctx.emergencyFundMonths) prompt += `- Emergency Fund Coverage: ${ctx.emergencyFundMonths} months\n`;
    if (ctx.loans) prompt += `- Total Loans: ₹${ctx.loans.toLocaleString()}\n`;
    if (ctx.emis) prompt += `- Monthly EMIs: ₹${ctx.emis.toLocaleString()}\n`;
    if (ctx.savingsRate) prompt += `- Savings Rate: ${ctx.savingsRate}%\n`;
    if (ctx.debtToIncomeRatio) prompt += `- Debt-to-Income Ratio: ${ctx.debtToIncomeRatio}%\n`;
    if (ctx.age) prompt += `- Age: ${ctx.age}\n`;
    if (ctx.goals && ctx.goals.length > 0) {
      prompt += `- Goals:\n`;
      for (const g of ctx.goals) {
        const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
        prompt += `  - ${g.title}: ₹${g.currentAmount.toLocaleString()}/₹${g.targetAmount.toLocaleString()} (${pct}% done)\n`;
      }
    }
    if (ctx.expenseBreakdown && ctx.expenseBreakdown.length > 0) {
      prompt += `- Expense Breakdown:\n`;
      for (const e of ctx.expenseBreakdown) {
        prompt += `  - ${e.name}: ₹${e.value.toLocaleString()}/mo\n`;
      }
    }
  }

  prompt += `\nGive specific, actionable advice based on the user's actual numbers. Use bullet points for clarity. If the user asks about something outside personal finance, gently steer back to financial topics.`;

  return prompt;
}

// ── Local rule-based recommendation engine (fallback) ──────────────────

function fmt(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function generateResponse(message: string, ctx: FinancialContext): string {
  const q = message.toLowerCase();
  const income = ctx.monthlyIncome ?? 0;
  const expenses = ctx.monthlyExpenses ?? 0;
  const savings = ctx.monthlySavings ?? 0;
  const netWorth = ctx.netWorth ?? 0;
  const healthScore = ctx.healthScore ?? 0;
  const inflation = ctx.inflationIndex ?? 5.5;
  const investments = ctx.investmentValue ?? 0;
  const emergencyMonths = ctx.emergencyFundMonths ?? 0;
  const loans = ctx.loans ?? 0;
  const emis = ctx.emis ?? 0;
  const savingsRate = ctx.savingsRate ?? 0;
  const dti = ctx.debtToIncomeRatio ?? 0;
  const age = ctx.age ?? 30;
  const goals = ctx.goals ?? [];

  if (q.includes("car")) return carAdvice(savings, income, emis, dti);
  if (q.includes("retire") || q.includes("retirement")) return retirementAdvice(age, expenses, savings, investments, inflation);
  if (q.includes("sip") || q.includes("invest") || q.includes("mutual fund") || q.includes("stock")) return investmentAdvice(savings, income, age, investments, inflation);
  if (q.includes("save") || q.includes("saving")) return savingsAdvice(income, expenses, savings, savingsRate);
  if (q.includes("inflation")) return inflationAdvice(inflation, expenses);
  if (q.includes("house") || q.includes("home")) return houseAdvice(savings, income, netWorth, emis);
  if (q.includes("emergency")) return emergencyAdvice(emergencyMonths, expenses);
  if (q.includes("health") || q.includes("score")) return healthAdvice(healthScore);
  if (q.includes("loan") || q.includes("debt") || q.includes("emi")) return debtAdvice(loans, emis, income, dti, savings);
  if (q.includes("goal") || q.includes("target")) return goalAdvice(goals, savings);
  if (q.includes("tax") || q.includes("ppf") || q.includes("nps") || q.includes("elss")) return taxAdvice(income, savings, age);
  if (q.includes("budget") || q.includes("expense") || q.includes("spend")) return budgetAdvice(income, expenses, ctx.expenseBreakdown);
  if (q.includes("net worth") || q.includes("wealth")) return wealthAdvice(netWorth, investments, savings, inflation);
  if (q.includes("insurance") || q.includes("life insurance") || q.includes("term")) return insuranceAdvice(income, age);

  return generalAdvice(income, expenses, savings, healthScore, inflation, emergencyMonths, dti);
}

function carAdvice(savings: number, income: number, emis: number, dti: number): string {
  const carBudget = income * 5;
  const downPayment = carBudget * 0.2;
  const monthlyForCar = Math.round(savings * 0.3);
  const monthsToDown = monthlyForCar > 0 ? Math.ceil(downPayment / monthlyForCar) : 0;
  const loanEmi = Math.round((carBudget - downPayment) * 0.9 / 60);
  const affordable = loanEmi + emis <= income * 0.4;
  return `Based on your income (${fmt(income)}/mo) and savings (${fmt(savings)}/mo), here's my car-buying analysis:

• Recommended car budget: ${fmt(carBudget)} (about 5x your monthly income)
• 20% down payment: ${fmt(downPayment)}
• Saving ${fmt(monthlyForCar)}/mo for the down payment, you'd be ready in ~${monthsToDown} months.
• Loan EMI for a 5-year term: ~${fmt(loanEmi)}/mo
• Your current EMIs: ${fmt(emis)}/mo → Total would be ${fmt(loanEmi + emis)}/mo

${affordable
  ? `This is affordable since total EMIs stay under 40% of your income. Go for it!`
  : `This would push your total EMIs above 40% of income — risky. Consider a cheaper car or a larger down payment.`}`;
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
  const additionalSip = gap < 0 ? Math.round(Math.abs(gap) / (Math.pow(1.12, yearsToRetire) - 1) / 12 * 0.1) : 0;

  return `Here's your retirement projection (retiring at 60, ${yearsToRetire} years away):

• Current monthly expenses: ${fmt(expenses)}
• Inflation-adjusted expenses at 60: ${fmt(futureExpenses)}/mo (at ${inflation}% inflation)
• Monthly pension needed: ${fmt(monthlyPension)}
• Corpus required (25 years of pension): ${fmt(corpusNeeded)}
• Projected corpus at current savings rate: ${fmt(projected)}

${gap >= 0
  ? `Great news — you're on track with a surplus of ${fmt(gap)}!`
  : `You have a gap of ${fmt(Math.abs(gap))}. To close it, increase your monthly SIP by ~${fmt(additionalSip)}/mo, or delay retirement by 3-5 years.`}

Tip: Allocate 60% to equity index funds and 40% to debt (PPF/NPS) for balanced growth.`;
}

function investmentAdvice(savings: number, income: number, age: number, investments: number, inflation: number): string {
  const equityPct = Math.max(20, Math.min(70, 100 - age));
  const debtPct = Math.max(10, 100 - equityPct - 25);
  const sipAmount = Math.round(savings * 0.6);
  const yearsToDouble = inflation > 0 ? Math.ceil(72 / 12) : 6;
  const futureValue = sipAmount * 12 * (Math.pow(1.12, 10) - 1) / 0.12;

  return `Here's my investment recommendation based on your profile (age ${age}, savings ${fmt(savings)}/mo):

**Recommended Allocation:**
• Index Funds: ${Math.round(equityPct * 0.55)}% — broad market, low cost, ~12% expected return
• Debt Funds: ${Math.round(debtPct)}% — stability, ~7% return
• Gold: 15% — inflation hedge, ~8% return
• PPF: 15% — tax-free, ~7.1% return
• Emergency Cash: 10% — liquid, ~4% return

**SIP Plan:**
• Start with ${fmt(sipAmount)}/month SIP
• Step up by 10% annually
• In 10 years, your SIP alone would grow to ~${fmt(futureValue)}
• At 12% returns, your money doubles every ${yearsToDouble} years

Your current investment value is ${fmt(investments)}. ${investments < income * 3 ? 'Consider increasing your investment allocation — it\'s low relative to your income.' : 'Your investment base is healthy. Keep compounding!'}`;
}

function savingsAdvice(income: number, expenses: number, savings: number, savingsRate: number): string {
  const idealSavings = income * 0.2;
  const status = savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'fair' : 'needs improvement';
  const extraSavings = Math.max(0, idealSavings - savings);

  return `Here's your savings analysis:

• Monthly income: ${fmt(income)}
• Monthly expenses: ${fmt(expenses)}
• Current savings: ${fmt(savings)}/mo (${savingsRate}% of income)
• Ideal savings target: ${fmt(idealSavings)}/mo (20% of income)

Your savings rate is ${status}. ${savingsRate < 20
  ? `You need to save an additional ${fmt(extraSavings)}/mo to reach the 20% target. Look at reducing discretionary expenses (food, shopping, entertainment) or increasing income.`
  : `You're saving above the recommended 20% — excellent discipline!`}

**Allocation of your savings:**
• 50% (${fmt(savings * 0.5)}) → SIP / mutual funds
• 30% (${fmt(savings * 0.3)}) → emergency fund (until 6 months covered)
• 20% (${fmt(savings * 0.2)}) → financial goals`;
}

function inflationAdvice(inflation: number, expenses: number): string {
  const nationalAvg = 5.5;
  const above = inflation > nationalAvg;
  const yearlyImpact = Math.round(expenses * 12 * inflation / 100);
  const tenYearImpact = Math.round(expenses * Math.pow(1 + inflation / 100, 10) - expenses);

  return `Your personal inflation index is ${inflation}%, ${above ? 'above' : 'in line with'} the national average of ${nationalAvg}%.

**Impact on your finances:**
• Current monthly expenses: ${fmt(expenses)}
• Extra cost per year due to inflation: ${fmt(yearlyImpact)}
• In 10 years, your monthly expenses will rise to ~${fmt(expenses * Math.pow(1 + inflation / 100, 10))} (increase of ${fmt(tenYearImpact)}/mo)

${above
  ? `Your inflation is high. Main drivers are typically food, rent, and fuel. To reduce personal inflation: lock in long-term rent, buy groceries in bulk, use public transport, and invest in inflation-beating assets (equity, gold).`
  : `Your inflation is manageable. Keep monitoring discretionary spending and maintain diversified investments in equity and gold to stay ahead.`}

To beat inflation, your investments need to return at least ${inflation}% annually — equity index funds historically return 12%.`;
}

function houseAdvice(savings: number, income: number, netWorth: number, emis: number): string {
  const houseBudget = income * 60;
  const downPayment = houseBudget * 0.2;
  const monthlyForHouse = Math.round(savings * 0.5);
  const years = monthlyForHouse > 0 ? (downPayment / monthlyForHouse / 12).toFixed(1) : 'N/A';
  const loanAmount = houseBudget - downPayment;
  const loanEmi = Math.round(loanAmount * 0.009 / (1 - Math.pow(1.009, -240)));
  const totalEmi = loanEmi + emis;
  const affordable = totalEmi <= income * 0.4;

  return `Here's your home-buying analysis:

• Recommended house budget: ${fmt(houseBudget)} (about 5x annual income)
• 20% down payment: ${fmt(downPayment)}
• Saving ${fmt(monthlyForHouse)}/mo for down payment: ~${years} years
• Loan amount: ${fmt(loanAmount)} for 20 years
• Estimated EMI: ${fmt(loanEmi)}/mo
• Your current EMIs: ${fmt(emis)}/mo → Total: ${fmt(totalEmi)}/mo

${affordable
  ? `This is within the safe zone (total EMIs under 40% of income). You can proceed.`
  : `This would push total EMIs to ${Math.round(totalEmi / income * 100)}% of income — above the safe 40% limit. Consider a smaller house, larger down payment, or wait until existing loans are cleared.`}

Current net worth: ${fmt(netWorth)}.`;
}

function emergencyAdvice(emergencyMonths: number, expenses: number): string {
  const target = 6;
  const currentFund = emergencyMonths * expenses;
  const targetFund = expenses * target;
  const shortfall = Math.max(0, targetFund - currentFund);

  return `Your emergency fund covers ${emergencyMonths.toFixed(1)} months of expenses.

• Current emergency fund: ${fmt(currentFund)}
• Recommended (6 months): ${fmt(targetFund)}
• ${emergencyMonths >= 6 ? 'You\'ve hit the target — great job!' : `Shortfall: ${fmt(shortfall)}`}

${emergencyMonths < 3
  ? 'Critical: Your emergency fund is below 3 months. This is a high-risk situation. Prioritize building this before investing.'
: emergencyMonths < 6
  ? `You're making progress. Save ${fmt(shortfall / 6)} more per month for 6 months to reach the target. Park this in a liquid mutual fund or high-yield savings account for easy access.`
  : 'Your emergency fund is healthy. Redirect surplus savings toward investments and goals.'}`;
}

function healthAdvice(healthScore: number): string {
  const tier = healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Fair' : 'Needs Work';
  return `Your financial health score is ${healthScore}/100 — ${tier}.

${healthScore >= 75
  ? 'You are financially healthy. Keep maintaining your savings rate, investment discipline, and insurance coverage. Focus on optimizing taxes and growing wealth.'
: healthScore >= 50
  ? 'You have a decent foundation but room for improvement. Priority actions:\n1. Build emergency fund to 6 months\n2. Start or increase your SIP\n3. Ensure you have term insurance\n4. Reduce high-interest debt'
: 'Your financial health needs urgent attention. Priority actions:\n1. Build a 3-month emergency fund immediately\n2. Stop discretionary spending temporarily\n3. Clear high-interest loans\n4. Start a small SIP (even ₹1,000/mo)\n5. Get term insurance if you have dependents'}

Review your dashboard for a detailed breakdown of each factor contributing to your score.`;
}

function debtAdvice(loans: number, emis: number, income: number, dti: number, savings: number): string {
  const safeLimit = income * 0.4;
  const surplus = Math.max(0, savings);
  const payoffMonths = surplus > 0 && loans > 0 ? Math.ceil(loans / (surplus + emis)) : 0;
  const avalanche = loans > 0 && surplus > 0 ? Math.ceil(loans / surplus) : 0;

  return `Here's your debt analysis:

• Total loans: ${fmt(loans)}
• Monthly EMIs: ${fmt(emis)}
• Debt-to-income ratio: ${dti}% of monthly income
• Safe limit: 40% (${fmt(safeLimit)}/mo)

${dti > 40
  ? 'Warning: Your EMIs exceed 40% of income. This is a debt trap risk. Consider:\n1. Prepay high-interest loans (personal loans, credit cards) first\n2. Avoid new loans until DTI drops below 30%\n3. Use the avalanche method — pay off the highest-interest loan first'
: dti > 20
  ? 'Your debt level is manageable but monitor it. Use any surplus to prepay loans and reduce interest burden.'
: 'Your debt level is healthy. Keep it this way.'}

${loans > 0 && surplus > 0
  ? `If you redirect your entire surplus (${fmt(surplus)}/mo) to loan prepayment, you could be debt-free in ~${avalanche} months.`
  : ''}`;
}

function goalAdvice(goals: FinancialContext['goals'], savings: number): string {
  if (!goals || goals.length === 0) {
    return `You haven't set any financial goals yet. Goals give direction to your savings. Consider setting up:\n1. Emergency fund (6 months of expenses)\n2. Retirement corpus\n3. A specific purchase (house, car, education)\n\nYou currently save ${fmt(savings)}/mo — allocate 20% to each goal for balanced progress.`;
  }

  const lines = goals.map((g) => {
    const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const monthlyNeeded = Math.round(remaining / 36);
    return `• ${g.title}: ${fmt(g.currentAmount)}/${fmt(g.targetAmount)} (${pct}% done) — save ${fmt(monthlyNeeded)}/mo to finish in 3 years`;
  });

  const totalMonthly = goals.reduce((sum, g) => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    return sum + Math.round(remaining / 36);
  }, 0);

  return `Here's your goal progress:\n\n${lines.join('\n')}\n\nTotal needed: ${fmt(totalMonthly)}/mo across all goals. ${totalMonthly <= savings ? 'This fits within your current savings — great!' : `This exceeds your savings of ${fmt(savings)}/mo. Consider increasing income or extending timelines.`}`;
}

function taxAdvice(income: number, savings: number, age: number): string {
  const annualIncome = income * 12;
  const section80c = Math.min(150000, Math.round(savings * 12 * 0.4));
  const section80ccd = Math.min(50000, Math.round(savings * 12 * 0.1));
  const totalDeduction = section80c + section80ccd;
  const taxSaved = Math.round(totalDeduction * 0.3);

  return `Here's your tax-saving strategy under the old regime:

• Annual income: ${fmt(annualIncome)}
• Section 80C (PPF, ELSS, NPS, life insurance): invest ${fmt(section80c)}/yr → max ₹1.5L deduction
• Section 80CCD(1B) (NPS additional): invest ${fmt(section80ccd)}/yr → extra ₹50K deduction
• Total tax saved: ~${fmt(taxSaved)}/yr (at 30% slab)

**Recommended:**
1. Start an ELSS mutual fund SIP — 3-year lock-in, market-linked returns
2. Max out PPF (₹1.5L/year) — tax-free, 7.1% return
3. Open an NPS account — additional ₹50K deduction + retirement corpus
4. Get term insurance (premium is tax-deductible under 80C)

At age ${age}, equity-linked savings (ELSS) are ideal for long-term wealth creation.`;
}

function budgetAdvice(income: number, expenses: number, breakdown?: { name: string; value: number }[]): string {
  const ratio = income > 0 ? Math.round((expenses / income) * 100) : 0;
  const surplus = income - expenses;

  let categoryMsg = '';
  if (breakdown && breakdown.length > 0) {
    const top = [...breakdown].sort((a, b) => b.value - a.value).slice(0, 3);
    categoryMsg = `\n\n**Top spending categories:**\n${top.map((c) => `• ${c.name}: ${fmt(c.value)}/mo`).join('\n')}`;
  }

  return `Here's your budget analysis:

• Monthly income: ${fmt(income)}
• Monthly expenses: ${fmt(expenses)} (${ratio}% of income)
• Surplus: ${fmt(surplus)}/mo

${ratio > 80
  ? 'Critical: You spend over 80% of your income. Immediate action needed — cut discretionary spending (dining out, shopping, entertainment) by 30%.'
: ratio > 60
  ? 'Caution: You spend over 60% of income. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'
: 'Good: Your spending is controlled. Keep it up.'}

**Recommended budget split (50/30/20):**
• Needs (rent, food, bills): ${fmt(income * 0.5)}
• Wants (entertainment, shopping): ${fmt(income * 0.3)}
• Savings & investments: ${fmt(income * 0.2)}${categoryMsg}`;
}

function wealthAdvice(netWorth: number, investments: number, savings: number, inflation: number): string {
  const investedPct = netWorth > 0 ? Math.round((investments / netWorth) * 100) : 0;
  const annualGrowth = investments * 0.12 + savings * 12;
  const fiveYearProjection = investments * Math.pow(1.12, 5) + savings * 12 * 5;

  return `Here's your wealth snapshot:

• Current net worth: ${fmt(netWorth)}
• Investment value: ${fmt(investments)} (${investedPct}% of net worth)
• Monthly savings: ${fmt(savings)}/mo
• Estimated annual wealth growth: ${fmt(annualGrowth)}
• Projected net worth in 5 years: ${fmt(fiveYearProjection)}

${investedPct < 40
  ? 'Your investment-to-net-worth ratio is low. Too much of your wealth may be sitting idle in savings accounts losing value to inflation. Move surplus to investments.'
: investedPct < 70
  ? 'Your investment allocation is balanced. Keep growing your SIP steadily.'
: 'You\'re heavily invested — great for long-term growth, but ensure you have a liquid emergency fund.'}

At ${inflation}% inflation, ₹100 today will be worth only ${fmt(100 / Math.pow(1 + inflation / 100, 10))} in 10 years. Invest to preserve purchasing power.`;
}

function insuranceAdvice(income: number, age: number): string {
  const coverNeeded = income * 12 * 15;
  const annualPremium = Math.round(coverNeeded * 0.003);

  return `Here's your insurance assessment:

• Recommended term insurance cover: ${fmt(coverNeeded)} (15x annual income)
• Estimated annual premium: ~${fmt(annualPremium)} (for a ${age}-year-old non-smoker)
• Policy term: until age 65

**Why term insurance?**
• It's the cheapest way to protect your family's income
• Pure life cover — no investment component, so premiums are low
• Provides financial security for dependents if something happens to you

**Also consider:**
• Health insurance: ₹5-10L family floater (~₹15,000-25,000/yr)
• Critical illness cover: ₹25-50L (rider on term plan)
• Avoid ULIPs and endowment policies — they mix insurance with investment poorly

At age ${age}, premiums are lower — buy term insurance early to lock in low rates.`;
}

function generalAdvice(income: number, expenses: number, savings: number, healthScore: number, inflation: number, emergencyMonths: number, dti: number): string {
  const priorities: string[] = [];

  if (emergencyMonths < 3) priorities.push('Build a 3-month emergency fund immediately');
  else if (emergencyMonths < 6) priorities.push('Top up emergency fund to 6 months');
  if (dti > 40) priorities.push('Reduce debt — EMIs exceed 40% of income');
  if (savings < income * 0.1) priorities.push('Increase savings to at least 10% of income');
  if (healthScore < 50) priorities.push('Improve financial health score (currently ' + healthScore + '/100)');
  if (priorities.length === 0) priorities.push('Start a SIP to grow long-term wealth');
  if (priorities.length < 3) priorities.push('Get term insurance if you have dependents');
  if (priorities.length < 3) priorities.push('Track your personal inflation (' + inflation + '%) quarterly');

  return `Here's a summary of your financial profile and priorities:

**Current snapshot:**
• Income: ${fmt(income)}/mo · Expenses: ${fmt(expenses)}/mo · Savings: ${fmt(savings)}/mo
• Health score: ${healthScore}/100 · Inflation index: ${inflation}% · Debt-to-income: ${dti}%

**Top priorities:**
${priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Ask me about any specific topic — buying a house, retirement, SIP, loans, insurance, or inflation!`;
}
