export interface OnboardingData {
  personal: {
    name: string;
    age: number;
    gender: string;
    city: string;
    state: string;
  };
  career: {
    occupation: string;
    company: string;
    salary: number;
    salaryGrowth: number;
    monthlyBonus: number;
  };
  family: {
    maritalStatus: string;
    familyMembers: number;
    children: number;
    dependents: number;
  };
  lifestyle: {
    housing: string;
    vehicle: string;
    insurance: number;
    loans: number;
    emis: number;
  };
  expenses: {
    food: number;
    groceries: number;
    rent: number;
    fuel: number;
    electricity: number;
    water: number;
    internet: number;
    medical: number;
    education: number;
    entertainment: number;
    shopping: number;
    travel: number;
    subscriptions: number;
    others: number;
  };
  savings: {
    emergencyFund: number;
    bankBalance: number;
    gold: number;
    mutualFunds: number;
    stocks: number;
    fd: number;
    ppf: number;
    nps: number;
    crypto: number;
    otherAssets: number;
  };
  goals: GoalInput[];
}

export interface GoalInput {
  title: string;
  targetAmount: number;
  deadline: string;
  category: string;
}

/** Row as stored in the database (snake_case) */
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  priority: string;
  read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialProfile {
  id: string;
  user_id: string;
  data: OnboardingData;
  created_at: string;
  updated_at: string;
}
