import type { OnboardingData } from './types';

export interface ComputedFinance {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  investmentValue: number;
  netWorth: number;
  financialHealthScore: number;
  personalInflationIndex: number;
  expenseBreakdown: { name: string; value: number }[];
  cashFlow: { name: string; value: number }[];
  aiInsights: { title: string; desc: string; priority: 'high' | 'medium' | 'low' }[];
  investmentAllocation: { name: string; pct: number; desc: string; expectedReturn: number }[];
  emergencyFund: { current: number; recommended: number; monthsCovered: number; pct: number };
  futureWealth: { year: number; savings: number; netWorth: number; investments: number; purchasingPower: number }[];
  retirement: { corpus: number; monthlyPension: number; inflationAdjustedExpenses: number; gap: number };
  expenseOptimization: { category: string; potentialSavings: number; lifestyleImpact: string; priority: 'high' | 'medium' | 'low' }[];
  savingsRate: number;
  expenseRatio: number;
  debtToIncomeRatio: number;
  financialIndependenceScore: number;
  healthBreakdown: { label: string; score: number; max: number; status: 'good' | 'fair' | 'poor' }[];
  inflationFactors: { factor: string; impact: number; weight: number }[];
  investmentReturns: { name: string; expectedReturn: number }[];
}

const EXPENSE_KEYS: (keyof OnboardingData['expenses'])[] = [
  'food', 'groceries', 'rent', 'fuel', 'electricity', 'water', 'internet',
  'medical', 'education', 'entertainment', 'shopping', 'travel', 'subscriptions', 'others',
];

const SAVINGS_KEYS: (keyof OnboardingData['savings'])[] = [
  'emergencyFund', 'bankBalance', 'gold', 'mutualFunds', 'stocks',
  'fd', 'ppf', 'nps', 'crypto', 'otherAssets',
];

const INVESTMENT_KEYS: (keyof OnboardingData['savings'])[] = [
  'mutualFunds', 'stocks', 'gold', 'fd', 'ppf', 'nps', 'crypto',
];

const CATEGORY_INFLATION_WEIGHTS: Record<string, number> = {
  food: 0.14, groceries: 0.12, rent: 0.18, fuel: 0.08, electricity: 0.06,
  water: 0.03, internet: 0.02, medical: 0.09, education: 0.10,
  entertainment: 0.05, shopping: 0.06, travel: 0.04, subscriptions: 0.02, others: 0.01,
};

const CITY_INFLATION_ADJUSTMENTS: Record<string, number> = {
  mumbai: 1.15, delhi: 1.12, bengaluru: 1.10, bangalore: 1.10, hyderabad: 1.05,
  chennai: 1.06, coimbatore: 1.03, madurai: 1.02, tiruchirappalli: 1.01, trichy: 1.01,
  salem: 1.00, pune: 1.04, kolkata: 1.03, ahmedabad: 1.02, jaipur: 0.98, lucknow: 0.95,
};

const NATIONAL_AVG = 5.5;

const EXPENSE_LABELS: Record<string, string> = {
  food: 'Food & Dining',
  groceries: 'Groceries',
  rent: 'House Rent',
  fuel: 'Fuel',
  electricity: 'EB (Electricity Bill)',
  water: 'Water',
  internet: 'Internet',
  medical: 'Medical Expenses',
  education: 'School Fees',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  travel: 'Travel',
  subscriptions: 'Subscriptions',
  others: 'Others',
};

const ASSET_EXPECTED_RETURNS: Record<string, number> = {
  'Index Funds': 0.12,
  'Debt Funds': 0.07,
  Gold: 0.08,
  PPF: 0.071,
  NPS: 0.10,
  'Emergency Cash': 0.04,
  'Fixed Deposit': 0.065,
};

export function computeFinance(data: OnboardingData): ComputedFinance {
  const monthlyIncome = (data.career.salary / 12) + data.career.monthlyBonus;
  const monthlyExpenses = EXPENSE_KEYS.reduce((sum, k) => sum + (data.expenses[k] || 0), 0);
  const monthlySavings = monthlyIncome - monthlyExpenses;

  const investmentValue = INVESTMENT_KEYS.reduce((sum, k) => sum + (data.savings[k] || 0), 0);
  const totalAssets = SAVINGS_KEYS.reduce((sum, k) => sum + (data.savings[k] || 0), 0);
  const netWorth = totalAssets - (data.lifestyle.loans || 0);

  const { personalInflationIndex, inflationFactors } = computeInflationIndex(data, monthlyExpenses);
  const { financialHealthScore, healthBreakdown } = computeHealthScore(data, monthlyIncome, monthlyExpenses, monthlySavings, totalAssets, investmentValue);

  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
  const debtToIncomeRatio = monthlyIncome > 0 ? ((data.lifestyle.emis || 0) / monthlyIncome) * 100 : 0;

  const fiScore = computeFIScore(monthlySavings, monthlyExpenses, investmentValue, data);

  const expenseBreakdown = EXPENSE_KEYS
    .map((k) => ({ name: EXPENSE_LABELS[k] ?? k.charAt(0).toUpperCase() + k.slice(1), value: data.expenses[k] || 0 }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);

  const cashFlow = [
    { name: 'Income', value: Math.round(monthlyIncome) },
    { name: 'Expenses', value: Math.round(monthlyExpenses) },
    { name: 'Savings', value: Math.round(Math.max(0, monthlySavings)) },
    { name: 'Investments', value: Math.round(monthlySavings * 0.6) },
    { name: 'Remaining', value: Math.round(Math.max(0, monthlySavings * 0.4)) },
  ];

  const aiInsights = generateInsights(data, monthlyIncome, monthlyExpenses, monthlySavings, personalInflationIndex, monthlyExpenses > 0 ? data.savings.emergencyFund / monthlyExpenses : 0);
  const investmentAllocation = generateAllocation(data);
  const investmentReturns = investmentAllocation.map((a) => ({ name: a.name, expectedReturn: a.expectedReturn }));

  const recommendedEmergency = monthlyExpenses * 6;
  const monthsCovered = monthlyExpenses > 0 ? data.savings.emergencyFund / monthlyExpenses : 0;
  const emergencyFund = {
    current: Math.round(data.savings.emergencyFund),
    recommended: Math.round(recommendedEmergency),
    monthsCovered: Math.round(monthsCovered * 10) / 10,
    pct: recommendedEmergency > 0 ? Math.min(100, (data.savings.emergencyFund / recommendedEmergency) * 100) : 0,
  };

  const futureWealth = projectFutureWealth(data, monthlyIncome, monthlyExpenses, investmentValue, personalInflationIndex);
  const retirement = computeRetirement(data, monthlyExpenses, monthlyIncome, investmentValue, personalInflationIndex);
  const expenseOptimization = optimizeExpenses(data, monthlyExpenses);

  return {
    monthlyIncome: Math.round(monthlyIncome),
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlySavings: Math.round(Math.max(0, monthlySavings)),
    investmentValue: Math.round(investmentValue),
    netWorth: Math.round(netWorth),
    financialHealthScore,
    personalInflationIndex,
    expenseBreakdown,
    cashFlow,
    aiInsights,
    investmentAllocation,
    emergencyFund,
    futureWealth,
    retirement,
    expenseOptimization,
    savingsRate: Math.round(savingsRate * 10) / 10,
    expenseRatio: Math.round(expenseRatio * 10) / 10,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
    financialIndependenceScore: fiScore,
    healthBreakdown,
    inflationFactors,
    investmentReturns,
  };
}

function computeInflationIndex(data: OnboardingData, monthlyExpenses: number): {
  personalInflationIndex: number;
  inflationFactors: { factor: string; impact: number; weight: number }[];
} {
  const cityKey = data.personal.city?.toLowerCase() ?? '';
  const cityMultiplier = CITY_INFLATION_ADJUSTMENTS[cityKey] ?? 1.0;
  const familyMultiplier = 1 + (data.family.familyMembers - 1) * 0.03;

  const factors: { factor: string; impact: number; weight: number }[] = [];
  let weightedInflation = 0;
  let totalWeight = 0;

  for (const k of EXPENSE_KEYS) {
    const spend = data.expenses[k] || 0;
    const w = CATEGORY_INFLATION_WEIGHTS[k] ?? 0.02;
    const shareOfMonthly = monthlyExpenses > 0 ? spend / monthlyExpenses : 0;
    const categoryMultiplier = spend > 0 ? 1 + shareOfMonthly * 0.5 : 0.5;
    const impact = NATIONAL_AVG * w * categoryMultiplier * cityMultiplier * familyMultiplier;
    weightedInflation += impact;
    totalWeight += w;
    if (spend > 0) {
      factors.push({ factor: EXPENSE_LABELS[k] ?? k.charAt(0).toUpperCase() + k.slice(1), impact: Math.round(impact * 100) / 100, weight: w });
    }
  }

  const personalInflationIndex = totalWeight > 0
    ? Math.round((weightedInflation / totalWeight) * 10) / 10
    : NATIONAL_AVG;

  factors.sort((a, b) => b.impact - a.impact);

  return { personalInflationIndex, inflationFactors: factors.slice(0, 8) };
}

function computeHealthScore(
  data: OnboardingData,
  income: number,
  expenses: number,
  savings: number,
  totalAssets: number,
  investments: number,
): { financialHealthScore: number; healthBreakdown: { label: string; score: number; max: number; status: 'good' | 'fair' | 'poor' }[] } {
  const savingsRate = income > 0 ? savings / income : 0;
  const emergencyMonths = expenses > 0 ? data.savings.emergencyFund / expenses : 0;
  const investmentRatio = totalAssets > 0 ? investments / totalAssets : 0;
  const debtRatio = totalAssets > 0 ? (data.lifestyle.loans || 0) / totalAssets : 0;
  const hasInsurance = (data.lifestyle.insurance || 0) > 0;
  const hasRetirementPlan = data.savings.ppf + data.savings.nps > 0;
  const expenseControl = income > 0 ? 1 - Math.min(1, expenses / income) : 0;

  const savingsScore = Math.min(savingsRate * 200, 20);
  const emergencyScore = Math.min(emergencyMonths * 4, 15);
  const debtScore = Math.max(0, 15 - debtRatio * 30);
  const investmentScore = Math.min(investmentRatio * 50, 20);
  const insuranceScore = hasInsurance ? 10 : 0;
  const retirementScore = hasRetirementPlan ? 10 : 5;
  const expenseControlScore = Math.min(expenseControl * 20, 10);

  const breakdown = [
    { label: 'Savings Rate', score: Math.round(savingsScore), max: 20, status: savingsScore >= 12 ? 'good' as const : savingsScore >= 6 ? 'fair' as const : 'poor' as const },
    { label: 'Emergency Fund', score: Math.round(emergencyScore), max: 15, status: emergencyScore >= 10 ? 'good' as const : emergencyScore >= 5 ? 'fair' as const : 'poor' as const },
    { label: 'Debt Management', score: Math.round(debtScore), max: 15, status: debtScore >= 10 ? 'good' as const : debtScore >= 5 ? 'fair' as const : 'poor' as const },
    { label: 'Investment Diversification', score: Math.round(investmentScore), max: 20, status: investmentScore >= 12 ? 'good' as const : investmentScore >= 6 ? 'fair' as const : 'poor' as const },
    { label: 'Insurance Coverage', score: insuranceScore, max: 10, status: insuranceScore > 0 ? 'good' as const : 'poor' as const },
    { label: 'Retirement Planning', score: retirementScore, max: 10, status: retirementScore >= 10 ? 'good' as const : 'fair' as const },
    { label: 'Expense Control', score: Math.round(expenseControlScore), max: 10, status: expenseControlScore >= 6 ? 'good' as const : expenseControlScore >= 3 ? 'fair' as const : 'poor' as const },
  ];

  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  return { financialHealthScore: Math.round(Math.max(0, Math.min(100, total))), healthBreakdown: breakdown };
}

function computeFIScore(monthlySavings: number, monthlyExpenses: number, investments: number, data: OnboardingData): number {
  const annualPassiveIncome = investments * 0.10;
  const annualExpenses = monthlyExpenses * 12;
  if (annualExpenses <= 0) return 0;
  const fiRatio = annualPassiveIncome / annualExpenses;
  const savingsBonus = monthlySavings > 0 ? Math.min(10, monthlySavings / 1000) : 0;
  return Math.round(Math.min(100, fiRatio * 100 + savingsBonus));
}

function generateInsights(
  data: OnboardingData,
  income: number,
  expenses: number,
  savings: number,
  inflation: number,
  emergencyMonths: number,
): ComputedFinance['aiInsights'] {
  const insights: ComputedFinance['aiInsights'] = [];
  const foodPct = expenses > 0 ? (data.expenses.food / expenses) * 100 : 0;
  if (foodPct > 20) {
    insights.push({
      title: `You spend ${Math.round(foodPct)}% more on food`,
      desc: 'Consider meal planning and home cooking to save up to ₹3,000/month.',
      priority: 'medium',
    });
  }
  if (savings > 0) {
    insights.push({
      title: `You can save ₹${Math.round(savings).toLocaleString('en-IN')} monthly`,
      desc: 'Auto-invest this into a SIP to build long-term wealth.',
      priority: 'high',
    });
  }
  if (data.expenses.subscriptions > 1000) {
    insights.push({
      title: 'Reduce unnecessary subscriptions',
      desc: `You spend ₹${data.expenses.subscriptions.toLocaleString('en-IN')}/mo on subscriptions. Audit and cancel unused ones.`,
      priority: 'low',
    });
  }
  if (emergencyMonths < 3) {
    insights.push({
      title: 'Emergency fund below recommended',
      desc: `You have ${emergencyMonths.toFixed(1)} months covered. Aim for 6 months of expenses.`,
      priority: 'high',
    });
  }
  if (inflation > NATIONAL_AVG) {
    insights.push({
      title: 'Your personal inflation is above average',
      desc: `At ${inflation}%, your lifestyle inflation outpaces the national ${NATIONAL_AVG}%. Review discretionary spending.`,
      priority: 'medium',
    });
  }
  if (data.savings.mutualFunds + data.savings.stocks === 0) {
    insights.push({
      title: 'Start investing in SIP',
      desc: 'Increase SIP by ₹2,000/month to beat inflation and build corpus.',
      priority: 'high',
    });
  }
  if (data.expenses.shopping > income * 0.1) {
    insights.push({
      title: 'Shopping exceeds 10% of income',
      desc: 'Set a shopping budget to avoid lifestyle creep.',
      priority: 'medium',
    });
  }
  if ((data.lifestyle.loans || 0) > totalAssets(data) * 0.5) {
    insights.push({
      title: 'High debt-to-asset ratio',
      desc: 'Prioritize paying down loans before increasing investments.',
      priority: 'high',
    });
  }
  return insights.slice(0, 6);
}

function totalAssets(data: OnboardingData): number {
  return SAVINGS_KEYS.reduce((sum, k) => sum + (data.savings[k] || 0), 0);
}

function generateAllocation(data: OnboardingData): ComputedFinance['investmentAllocation'] {
  const age = data.personal.age || 30;
  const equityWeight = Math.max(20, Math.min(70, 100 - age));
  const debtWeight = Math.max(10, 100 - equityWeight - 25);

  return [
    { name: 'Index Funds', pct: Math.round(equityWeight * 0.55), desc: 'Low-cost broad market exposure for long-term growth.', expectedReturn: ASSET_EXPECTED_RETURNS['Index Funds'] },
    { name: 'Debt Funds', pct: Math.round(debtWeight), desc: 'Stable returns to cushion market volatility.', expectedReturn: ASSET_EXPECTED_RETURNS['Debt Funds'] },
    { name: 'Gold', pct: 15, desc: 'Hedge against inflation and currency depreciation.', expectedReturn: ASSET_EXPECTED_RETURNS.Gold },
    { name: 'PPF', pct: 15, desc: 'Tax-advantaged long-term retirement savings.', expectedReturn: ASSET_EXPECTED_RETURNS.PPF },
    { name: 'Emergency Cash', pct: 10, desc: 'Liquid funds for 6 months of expenses.', expectedReturn: ASSET_EXPECTED_RETURNS['Emergency Cash'] },
  ];
}

function projectFutureWealth(data: OnboardingData, income: number, expenses: number, investments: number, inflation: number) {
  const years = [5, 10, 20, 30];
  const annualSavings = Math.max(0, income - expenses) * 12;
  const investmentReturn = 0.12;
  const inflationRate = inflation / 100;

  return years.map((y) => {
    let inv = investments;
    for (let i = 0; i < y; i++) {
      inv = inv * (1 + investmentReturn) + annualSavings;
    }
    const savingsTotal = annualSavings * y + data.savings.bankBalance + data.savings.emergencyFund;
    const netWorth = inv + savingsTotal;
    const purchasingPower = netWorth / Math.pow(1 + inflationRate, y);
    return {
      year: y,
      savings: Math.round(savingsTotal),
      netWorth: Math.round(netWorth),
      investments: Math.round(inv),
      purchasingPower: Math.round(purchasingPower),
    };
  });
}

function computeRetirement(data: OnboardingData, expenses: number, income: number, investments: number, inflation: number) {
  const age = data.personal.age || 30;
  const retirementAge = 60;
  const yearsToRetire = Math.max(1, retirementAge - age);
  const yearsInRetirement = 25;
  const inflationRate = inflation / 100;
  const investmentReturn = 0.12;

  const futureMonthlyExpenses = expenses * Math.pow(1 + inflationRate, yearsToRetire);
  const inflationAdjustedExpenses = Math.round(futureMonthlyExpenses);
  const monthlyPension = Math.round(futureMonthlyExpenses * 0.8);
  const corpusNeeded = monthlyPension * 12 * yearsInRetirement;

  let projectedCorpus = investments;
  const annualSavings = Math.max(0, income - expenses) * 12;
  for (let i = 0; i < yearsToRetire; i++) {
    projectedCorpus = projectedCorpus * (1 + investmentReturn) + annualSavings;
  }

  const gap = Math.round(projectedCorpus - corpusNeeded);

  return {
    corpus: Math.round(projectedCorpus),
    monthlyPension,
    inflationAdjustedExpenses,
    gap,
  };
}

function optimizeExpenses(data: OnboardingData, _totalExpenses: number): ComputedFinance['expenseOptimization'] {
  const items: ComputedFinance['expenseOptimization'] = [];
  if (data.expenses.subscriptions > 800) {
    items.push({ category: 'Subscriptions', potentialSavings: Math.round(data.expenses.subscriptions * 0.4), lifestyleImpact: 'Cancel 2-3 unused streaming/app subscriptions.', priority: 'low' });
  }
  if (data.expenses.shopping > 3000) {
    items.push({ category: 'Shopping', potentialSavings: Math.round(data.expenses.shopping * 0.3), lifestyleImpact: 'Delay non-essential purchases by 30 days.', priority: 'medium' });
  }
  if (data.expenses.food > 4000) {
    items.push({ category: 'Food', potentialSavings: Math.round(data.expenses.food * 0.25), lifestyleImpact: 'Reduce dining out to once a week.', priority: 'medium' });
  }
  if (data.expenses.travel > 5000) {
    items.push({ category: 'Travel', potentialSavings: Math.round(data.expenses.travel * 0.2), lifestyleImpact: 'Book flights early, use reward points.', priority: 'low' });
  }
  if (data.expenses.entertainment > 2000) {
    items.push({ category: 'Entertainment', potentialSavings: Math.round(data.expenses.entertainment * 0.35), lifestyleImpact: 'Swap paid outings for free community events.', priority: 'low' });
  }
  return items;
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatCurrencyFull(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}
