'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  User,
  Briefcase,
  Users,
  Home,
  Wallet,
  PiggyBank,
  Target,
  ArrowRight,
  ArrowLeft,
  Loader2,
  PartyPopper,
  Check,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { OnboardingData } from '@/lib/types';

import {
  Field,
  TextInput,
  SelectInput,
  StepWrapper,
} from '@/components/onboarding/fields';

import { locale } from '@/lib/locale';

import {
  formatIndianCurrency,
  numberToIndianWords,
} from '@/lib/indian-number';

const TOTAL_STEPS = 7;

/* -------------------------------------------------------------------------- */
/*                              GOAL TEMPLATES                                */
/* -------------------------------------------------------------------------- */

const GOAL_TEMPLATES = [
  {
    title: 'Buy House',
    category: 'house',
    defaultAmount: 5000000,
  },
  {
    title: 'Buy Car',
    category: 'car',
    defaultAmount: 800000,
  },
  {
    title: 'Marriage',
    category: 'marriage',
    defaultAmount: 1000000,
  },
  {
    title: 'Child Education',
    category: 'education',
    defaultAmount: 2000000,
  },
  {
    title: 'Family / Personal Travel',
    category: 'travel',
    defaultAmount: 300000,
  },
  {
    title: 'Retirement',
    category: 'retirement',
    defaultAmount: 10000000,
  },
  {
    title: 'Emergency Fund',
    category: 'emergency',
    defaultAmount: 300000,
  },
];

/* -------------------------------------------------------------------------- */
/*                             INITIAL STATE                                  */
/* -------------------------------------------------------------------------- */

const initialState: OnboardingData = {
  personal: {
    name: '',
    age: 25,
    gender: '',
    city: '',
    state: '',
  },

  career: {
    occupation: '',
    company: '',
    salary: 0,
    salaryGrowth: 5,
    monthlyBonus: 0,
  },

  family: {
    maritalStatus: 'single',
    familyMembers: 1,
    children: 0,
    dependents: 0,
  },

  lifestyle: {
    housing: 'rent',
    vehicle: 'none',
    insurance: 0,
    loans: 0,
    emis: 0,
  },

  expenses: {
    food: 0,
    groceries: 0,
    rent: 0,
    fuel: 0,
    electricity: 0,
    water: 0,
    internet: 0,
    medical: 0,
    education: 0,
    educationFrequency: 'monthly',
    entertainment: 0,
    shopping: 0,
    travel: 0,
    subscriptions: 0,
    others: 0,
  },

  savings: {
    emergencyFund: 0,
    bankBalance: 0,
    gold: 0,
    mutualFunds: 0,
    stocks: 0,
    fd: 0,
    ppf: 0,
    nps: 0,

    // Kept internally for compatibility with existing OnboardingData.
    // It is NOT shown to the user.
    crypto: 0,

    otherAssets: 0,
  },

  goals: [],
};

/* -------------------------------------------------------------------------- */
/*                         REUSABLE MONEY FIELD                               */
/* -------------------------------------------------------------------------- */

function MoneyField({
  label,
  value,
  onChange,
  placeholder = '0',
}: {
  label: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <TextInput
        type="number"
        min="0"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
      />

      {value > 0 && (
        <div className="mt-2 space-y-0.5">
          <p className="text-sm font-semibold text-primary">
            {formatIndianCurrency(value)}
          </p>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {numberToIndianWords(value)}
          </p>
        </div>
      )}
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*                            ONBOARDING PAGE                                 */
/* -------------------------------------------------------------------------- */

export default function OnboardingPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [data, setData] =
    useState<OnboardingData>(initialState);

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /*                                AUTH                                      */
  /* ------------------------------------------------------------------------ */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /*                                UPDATE                                    */
  /* ------------------------------------------------------------------------ */

  const update = (
    section: keyof OnboardingData,
    field: string,
    value: unknown,
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  /* ------------------------------------------------------------------------ */
  /*                            STEP VALIDATION                               */
  /* ------------------------------------------------------------------------ */

  const canProceed = () => {
    if (step === 0) {
      return (
        data.personal.name.trim().length > 0 &&
        data.personal.age > 0
      );
    }

    if (step === 1) {
      return data.career.salary > 0;
    }

    return true;
  };

  /* ------------------------------------------------------------------------ */
  /*                               NEXT                                       */
  /* ------------------------------------------------------------------------ */

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                               FINISH                                     */
  /* ------------------------------------------------------------------------ */

  const handleFinish = async () => {
    setSaving(true);
    setError(null);

    try {
      const { error: pErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: data.personal.name,
          onboarded: true,
        });

      if (pErr) throw pErr;

      const { error: fErr } = await supabase
        .from('financial_profiles')
        .upsert({
          user_id: user.id,
          data,
        });

      if (fErr) throw fErr;

      if (data.goals.length > 0) {
        const goalRows = data.goals.map((g) => ({
          user_id: user.id,
          title: g.title,
          target_amount: g.targetAmount,
          deadline: g.deadline,
          category: g.category,
        }));

        const { error: gErr } = await supabase
          .from('goals')
          .insert(goalRows);

        if (gErr) throw gErr;
      }

      /* ------------------------- Welcome notifications -------------------- */

      const notifs = [
        {
          user_id: user.id,
          title: 'Welcome to InflationOS',
          body: 'Your financial intelligence dashboard is ready.',
          type: 'general',
          priority: 'low',
        },
        {
          user_id: user.id,
          title: 'Complete your profile',
          body: 'Review your AI insights and investment allocation.',
          type: 'general',
          priority: 'medium',
        },
        {
          user_id: user.id,
          title: 'Emergency fund check',
          body: 'See if your emergency fund covers 6 months of expenses.',
          type: 'emergency',
          priority: 'high',
        },
      ];

      await supabase
        .from('notifications')
        .insert(notifs);

      setDone(true);

      setTimeout(() => {
        router.replace('/dashboard');
      }, 2600);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to save your data. Please try again.',
      );

      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                              CELEBRATION                                 */
  /* ------------------------------------------------------------------------ */

  if (done) {
    return <Celebration name={data.personal.name} />;
  }

  /* ------------------------------------------------------------------------ */
  /*                                UI                                        */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="relative min-h-screen overflow-hidden bg-grid">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px]" />

        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="flex items-center justify-between px-6 py-5">

        <Link
          href="/"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <span className="font-display text-lg font-bold">
            Inflation
            <span className="text-gradient">OS</span>
          </span>
        </Link>

        <span className="text-sm text-muted-foreground">
          Step {step + 1} of {TOTAL_STEPS}
        </span>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* PROGRESS BAR                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="mx-auto max-w-3xl px-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{
              width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
            }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT                                                       */}
      {/* ------------------------------------------------------------------ */}

      <main className="mx-auto max-w-3xl px-6 py-10">

        <AnimatePresence mode="wait">

          {/* ================================================================ */}
          {/* STEP 1 — PERSONAL                                               */}
          {/* ================================================================ */}

          {step === 0 && (
            <StepWrapper
              key="s0"
              title="Personal Details"
              subtitle="Tell us about yourself"
              icon={<User className="h-6 w-6" />}
            >

              <Field label="Full Name">
                <TextInput
                  value={data.personal.name}
                  onChange={(e) =>
                    update(
                      'personal',
                      'name',
                      e.target.value,
                    )
                  }
                  placeholder="Your name"
                />
              </Field>

              <Field label="Age">
                <TextInput
                  type="number"
                  value={data.personal.age || ''}
                  onChange={(e) =>
                    update(
                      'personal',
                      'age',
                      Number(e.target.value),
                    )
                  }
                  placeholder="25"
                />
              </Field>

              {/* Gender removed intentionally */}

              <Field label="City">
                <TextInput
                  value={data.personal.city}
                  onChange={(e) =>
                    update(
                      'personal',
                      'city',
                      e.target.value,
                    )
                  }
                  placeholder="Chennai"
                  list="city-list"
                />

                <datalist id="city-list">
                  {locale.cities.map((c) => (
                    <option
                      key={c}
                      value={c}
                    />
                  ))}
                </datalist>
              </Field>

              <Field label="State">
                <TextInput
                  value={data.personal.state}
                  onChange={(e) =>
                    update(
                      'personal',
                      'state',
                      e.target.value,
                    )
                  }
                  placeholder="Tamil Nadu"
                  list="state-list"
                />

                <datalist id="state-list">
                  {locale.states.map((s) => (
                    <option
                      key={s}
                      value={s}
                    />
                  ))}
                </datalist>
              </Field>

            </StepWrapper>
          )}

          {/* ================================================================ */}
          {/* STEP 2 — CAREER                                                 */}
          {/* ================================================================ */}

          {step === 1 && (
            <StepWrapper
              key="s1"
              title="Career"
              subtitle="Your income and growth"
              icon={<Briefcase className="h-6 w-6" />}
            >

              <Field label="Occupation">
                <TextInput
                  value={data.career.occupation}
                  onChange={(e) =>
                    update(
                      'career',
                      'occupation',
                      e.target.value,
                    )
                  }
                  placeholder="Software Engineer"
                />
              </Field>

              <Field label="Company">
                <TextInput
                  value={data.career.company}
                  onChange={(e) =>
                    update(
                      'career',
                      'company',
                      e.target.value,
                    )
                  }
                  placeholder="Company name"
                />
              </Field>

              <MoneyField
                label="Monthly Salary (₹)"
                value={data.career.salary}
                onChange={(e) =>
                  update(
                    'career',
                    'salary',
                    Number(e.target.value),
                  )
                }
                placeholder="80000"
              />

              <Field label="Salary Growth (% per year)">
                <TextInput
                  type="number"
                  value={data.career.salaryGrowth}
                  onChange={(e) =>
                    update(
                      'career',
                      'salaryGrowth',
                      Number(e.target.value),
                    )
                  }
                  placeholder="5"
                />
              </Field>

              <MoneyField
                label="Monthly Bonus (₹)"
                value={data.career.monthlyBonus}
                onChange={(e) =>
                  update(
                    'career',
                    'monthlyBonus',
                    Number(e.target.value),
                  )
                }
                placeholder="10000"
              />

            </StepWrapper>
          )}

          {/* ================================================================ */}
          {/* STEP 3 — FAMILY                                                 */}
          {/* ================================================================ */}

          {step === 2 && (
            <StepWrapper
              key="s2"
              title="Family"
              subtitle="Who depends on you"
              icon={<Users className="h-6 w-6" />}
            >

              <Field label="Marital Status">
                <SelectInput
                  value={data.family.maritalStatus}
                  onChange={(e) =>
                    update(
                      'family',
                      'maritalStatus',
                      e.target.value,
                    )
                  }
                >
                  <option value="single">
                    Single
                  </option>

                  <option value="married">
                    Married
                  </option>
                </SelectInput>
              </Field>

              <Field label="Number of Family Members">
                <TextInput
                  type="number"
                  value={data.family.familyMembers}
                  onChange={(e) =>
                    update(
                      'family',
                      'familyMembers',
                      Number(e.target.value),
                    )
                  }
                  placeholder="3"
                />
              </Field>

              <Field label="Children">
                <TextInput
                  type="number"
                  value={data.family.children}
                  onChange={(e) =>
                    update(
                      'family',
                      'children',
                      Number(e.target.value),
                    )
                  }
                  placeholder="0"
                />
              </Field>

              <Field label="Dependents">
                <TextInput
                  type="number"
                  value={data.family.dependents}
                  onChange={(e) =>
                    update(
                      'family',
                      'dependents',
                      Number(e.target.value),
                    )
                  }
                  placeholder="2"
                />
              </Field>

            </StepWrapper>
          )}

          {/* ================================================================ */}
          {/* STEP 4 — LIFESTYLE                                               */}
          {/* ================================================================ */}

          {step === 3 && (
            <StepWrapper
              key="s3"
              title="Lifestyle"
              subtitle="Your living situation"
              icon={<Home className="h-6 w-6" />}
            >

              <Field label="Housing">
                <SelectInput
                  value={data.lifestyle.housing}
                  onChange={(e) =>
                    update(
                      'lifestyle',
                      'housing',
                      e.target.value,
                    )
                  }
                >
                  <option value="rent">
                    Rent
                  </option>

                  <option value="own">
                    Own House
                  </option>
                </SelectInput>
              </Field>

              <Field label="Vehicle">
                <SelectInput
                  value={data.lifestyle.vehicle}
                  onChange={(e) =>
                    update(
                      'lifestyle',
                      'vehicle',
                      e.target.value,
                    )
                  }
                >
                  <option value="none">
                    None
                  </option>

                  <option value="bike">
                    Bike
                  </option>

                  <option value="car">
                    Car
                  </option>

                  <option value="both">
                    Both
                  </option>
                </SelectInput>
              </Field>

              <MoneyField
                label="Annual Insurance (₹)"
                value={data.lifestyle.insurance}
                onChange={(e) =>
                  update(
                    'lifestyle',
                    'insurance',
                    Number(e.target.value),
                  )
                }
                placeholder="25000"
              />

              <MoneyField
                label="Total Loans (₹)"
                value={data.lifestyle.loans}
                onChange={(e) =>
                  update(
                    'lifestyle',
                    'loans',
                    Number(e.target.value),
                  )
                }
                placeholder="500000"
              />

              <MoneyField
                label="Monthly EMIs (₹)"
                value={data.lifestyle.emis}
                onChange={(e) =>
                  update(
                    'lifestyle',
                    'emis',
                    Number(e.target.value),
                  )
                }
                placeholder="15000"
              />

            </StepWrapper>
          )}

         {/* ================================================================ */}
{/* STEP 5 — EXPENSES                                                */}
{/* ================================================================ */}

{step === 4 && (
  <StepWrapper
    key="s4"
    title="Monthly Expenses"
    subtitle="Where your money goes"
    icon={<Wallet className="h-6 w-6" />}
  >

    {(
      [
        'food',
        'groceries',
        'rent',
        'fuel',
        'electricity',
        'water',
        'internet',
        'medical',
        'entertainment',
        'shopping',
        'travel',
        'subscriptions',
        'others',
      ] as const
    ).map((k) => (
      <MoneyField
        key={k}
        label={`${locale.expenseLabels[k]} (₹)`}
        value={data.expenses[k]}
        onChange={(e) =>
          update(
            'expenses',
            k,
            Number(e.target.value),
          )
        }
        placeholder="0"
      />
    ))}

    {/* Education Fees */}
    <MoneyField
      label="Education Fees (₹)"
      value={data.expenses.education}
      onChange={(e) =>
        update(
          'expenses',
          'education',
          Number(e.target.value),
        )
      }
      placeholder="0"
    />

    {/* Education Fee Frequency */}
    <div className="mt-4">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        Education Fee Frequency
      </label>

      <select
        value={data.expenses.educationFrequency}
        onChange={(e) =>
          update(
            'expenses',
            'educationFrequency',
            e.target.value as
              | 'monthly'
              | 'yearly'
              | 'semester',
          )
        }
        className="h-11 w-full rounded-xl glass px-3.5 text-sm outline-none ring-primary/40 transition-all focus:ring-2"
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
        <option value="semester">Semester</option>
      </select>
    </div>

    {/* Monthly Equivalent */}
    {data.expenses.education > 0 && (
      <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs text-muted-foreground">
          Monthly equivalent
        </p>

        <p className="mt-1 text-sm font-semibold text-primary">
          ₹
          {Math.round(
            data.expenses.education /
              (data.expenses.educationFrequency === 'yearly'
                ? 12
                : data.expenses.educationFrequency === 'semester'
                  ? 6
                  : 1)
          ).toLocaleString('en-IN')}
        </p>
      </div>
    )}

  </StepWrapper>
)}

          {/* ================================================================ */}
          {/* STEP 6 — SAVINGS & INVESTMENTS                                  */}
          {/* ================================================================ */}

          {step === 5 && (
            <StepWrapper
              key="s5"
              title="Savings & Investments"
              subtitle="What you've built so far"
              icon={<PiggyBank className="h-6 w-6" />}
            >

              {(
                [
                  'emergencyFund',
                  'bankBalance',
                  'gold',
                  'mutualFunds',
                  'stocks',
                  'fd',
                  'ppf',
                  'nps',
                  'otherAssets',
                ] as const
              ).map((k) => (
                <MoneyField
                  key={k}
                  label={`${locale.savingsLabels[k]} (₹)`}
                  value={data.savings[k]}
                  onChange={(e) =>
                    update(
                      'savings',
                      k,
                      Number(e.target.value),
                    )
                  }
                  placeholder="0"
                />
              ))}

            </StepWrapper>
          )}

          {/* ================================================================ */}
          {/* STEP 7 — FINANCIAL GOALS                                        */}
          {/* ================================================================ */}

          {step === 6 && (
            <motion.div
              key="s6"
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -40,
              }}
              transition={{
                duration: 0.4,
              }}
              className="space-y-6"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30">
                  <Target className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold">
                    Financial Goals
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Pick the goals you want to track
                  </p>
                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                {GOAL_TEMPLATES.map((g) => {

                  const selected = data.goals.find(
                    (x) => x.title === g.title,
                  );

                  return (
                    <button
                      key={g.title}
                      type="button"
                      onClick={() => {

                        setData((prev) => {

                          const exists =
                            prev.goals.find(
                              (x) =>
                                x.title === g.title,
                            );

                          if (exists) {
                            return {
                              ...prev,
                              goals:
                                prev.goals.filter(
                                  (x) =>
                                    x.title !== g.title,
                                ),
                            };
                          }

                          return {
                            ...prev,
                            goals: [
                              ...prev.goals,
                              {
                                title: g.title,
                                targetAmount:
                                  g.defaultAmount,
                                deadline:
                                  new Date(
                                    Date.now() +
                                      5 *
                                        365 *
                                        24 *
                                        60 *
                                        60 *
                                        1000,
                                  )
                                    .toISOString()
                                    .slice(0, 10),
                                category:
                                  g.category,
                              },
                            ],
                          };
                        });
                      }}
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                          : 'glass hover:shadow-md'
                      }`}
                    >

                      <div>
                        <p className="font-semibold">
                          {g.title}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatIndianCurrency(
                            g.defaultAmount,
                          )}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {numberToIndianWords(
                            g.defaultAmount,
                          )}
                        </p>
                      </div>

                      {selected && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                    </button>
                  );
                })}

              </div>

              {/* Custom goal */}
              <div className="rounded-2xl glass p-4">

                <p className="mb-2 text-sm font-medium">
                  Add a custom goal
                </p>

                <div className="grid gap-3 sm:grid-cols-3">

                  <TextInput
                    placeholder="Goal name"
                    onChange={() => {
                      // Custom goal logic can be connected later.
                    }}
                  />

                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* ---------------------------------------------------------------- */}
        {/* ERROR                                                            */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="mt-6 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* NAVIGATION                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-10 flex items-center justify-between">

          <button
            type="button"
            onClick={() =>
              setStep(
                Math.max(0, step - 1),
              )
            }
            disabled={
              step === 0 || saving
            }
            className="flex items-center gap-2 rounded-xl glass px-5 py-2.5 text-sm font-semibold transition-all hover:shadow-md disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={
              !canProceed() || saving
            }
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50"
          >

            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {step === TOTAL_STEPS - 1
                  ? 'Finish'
                  : 'Continue'}

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}

          </button>

        </div>

      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CELEBRATION                                  */
/* -------------------------------------------------------------------------- */

function Celebration({
  name,
}: {
  name: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-grid">

      <div className="pointer-events-none absolute inset-0 -z-10">

        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-success/20 blur-[120px]" />

      </div>

      {/* Confetti */}
      {Array.from({ length: 40 }).map(
        (_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              background: [
                '#6D5DF6',
                '#8B5CF6',
                '#06B6D4',
                '#10B981',
              ][i % 4],
            }}
            initial={{
              y: -20,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              y: '110vh',
              opacity: 0,
              rotate: 360,
            }}
            transition={{
              duration:
                2.5 +
                Math.random() * 1.5,
              delay:
                Math.random() * 0.6,
              ease: 'easeIn',
            }}
          />
        ),
      )}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.6,
        }}
        className="text-center"
      >

        <motion.div
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
            rotate: [
              0,
              -10,
              10,
              0,
            ],
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-success to-accent shadow-2xl shadow-success/30"
        >
          <PartyPopper className="h-10 w-10 text-white" />
        </motion.div>

        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          You&apos;re all set,{' '}
          <span className="text-gradient">
            {name || 'there'}
          </span>
          !
        </h1>

        <p className="mt-3 text-muted-foreground">
          Taking you to your financial intelligence dashboard...
        </p>

        <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-muted">

          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{
              width: '0%',
            }}
            animate={{
              width: '100%',
            }}
            transition={{
              duration: 2.4,
            }}
          />

        </div>

      </motion.div>
    </div>
  );
}