/**
 * Locale configuration for InflationOS.
 *
 * Default locale: en-IN (English, India)
 * Default country: India
 * Default currency: Indian Rupee (₹)
 *
 * Architecture is designed for future Tamil (ta-IN) support.
 * To add Tamil: extend the `LocaleConfig` type with a `ta-IN` entry
 * and wire a locale switcher into the UI.
 */

export type SupportedLocale = 'en-IN' | 'ta-IN';

export interface LocaleConfig {
  locale: string;
  currencySymbol: string;
  currencyCode: string;
  country: string;
  /** Indian numbering system grouping */
  numberGrouping: 'en-IN';
  /** Maps internal expense keys to user-facing labels */
  expenseLabels: Record<string, string>;
  /** Maps internal savings keys to user-facing labels */
  savingsLabels: Record<string, string>;
  /** City list for onboarding datalist + inflation adjustments */
  cities: string[];
  /** State list for onboarding */
  states: string[];
}

const expenseLabels: Record<string, string> = {
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

const savingsLabels: Record<string, string> = {
  emergencyFund: 'Emergency Fund',
  bankBalance: 'Bank Balance',
  gold: 'Gold / Gold ETF',
  mutualFunds: 'Mutual Funds / SIP',
  stocks: 'Stocks / Direct Equity',
  fd: 'Fixed Deposit (FD)',
  ppf: 'PPF',
  nps: 'NPS',
  crypto: 'Crypto',
  otherAssets: 'Other Assets',
};

const cities = [
  // Tamil Nadu
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thoothukudi',
  'Dindigul',
  'Thanjavur',
  'Ranipet',
  'Kanchipuram',
  'Karur',
  'Namakkal',
  'Cuddalore',
  'Tiruvannamalai',
  'Villupuram',
  'Nagapattinam',
  'Mayiladuthurai',
  'Sivaganga',
  'Ramanathapuram',
  'Virudhunagar',
  'Pudukkottai',
  'Dharmapuri',
  'Krishnagiri',
  'Ariyalur',
  'Perambalur',
  'Tenkasi',
  'Kallakurichi',

  // Other major Indian cities
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Delhi',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Kochi',
  'Thiruvananthapuram',
  'Visakhapatnam',
  'Vijayawada',
  'Bhubaneswar',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Bhopal',
  'Indore',
  'Patna',
  'Guwahati',
];

const states = [
  'Tamil Nadu',
  'Karnataka',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'West Bengal',
  'Kerala',
  'Andhra Pradesh',
  'Uttar Pradesh',
];

const enIN: LocaleConfig = {
  locale: 'en-IN',
  currencySymbol: '₹',
  currencyCode: 'INR',
  country: 'India',
  numberGrouping: 'en-IN',
  expenseLabels,
  savingsLabels,
  cities,
  states,
};

// Future: const taIN: LocaleConfig = { ...enIN, locale: 'ta-IN', expenseLabels: { ... tamilLabels } };

const configs: Partial<Record<SupportedLocale, LocaleConfig>> = {
  'en-IN': enIN,
  // 'ta-IN': taIN, // Uncomment when Tamil translations are ready
};

export const ACTIVE_LOCALE: SupportedLocale = 'en-IN';

export const locale: LocaleConfig = configs[ACTIVE_LOCALE]!;

/** Format a number using the Indian numbering system (e.g. 1,25,000) */
export function formatINR(value: number): string {
  return value.toLocaleString(locale.numberGrouping);
}

/** Format with currency symbol prefix */
export function formatCurrencyINR(value: number): string {
  return `${locale.currencySymbol}${formatINR(value)}`;
}

/** Get user-facing label for an expense key */
export function expenseLabel(key: string): string {
  return locale.expenseLabels[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/** Get user-facing label for a savings key */
export function savingsLabel(key: string): string {
  return locale.savingsLabels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}
