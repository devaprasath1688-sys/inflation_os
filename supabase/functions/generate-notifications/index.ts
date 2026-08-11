import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  userId: string;
  finance: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    emergencyFundMonths: number;
    healthScore: number;
    inflationIndex: number;
    goalsProgress?: { title: string; pct: number }[];
  };
}

/**
 * Notification Generator Edge Function
 *
 * Analyzes a user's financial data and generates relevant notifications:
 * - Budget alerts (expenses > 80% of income)
 * - Emergency fund warnings (< 3 months)
 * - Health score alerts (< 50)
 * - Inflation warnings (> 7%)
 * - Goal milestone celebrations (> 50% or > 90%)
 * - Salary reminders
 * - Investment reminders
 *
 * Returns generated notifications to be inserted into the notifications table.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userId, finance } = (await req.json()) as NotificationRequest;

    if (!userId || !finance) {
      return new Response(
        JSON.stringify({ error: "userId and finance are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const notifications: { user_id: string; title: string; body: string; type: string; priority: string }[] = [];

    // Budget alert
    const expenseRatio = finance.monthlyIncome > 0 ? (finance.monthlyExpenses / finance.monthlyIncome) * 100 : 0;
    if (expenseRatio > 80) {
      notifications.push({
        user_id: userId,
        title: "Budget Alert",
        body: `Your expenses are ${Math.round(expenseRatio)}% of your income. Consider cutting discretionary spending.`,
        type: "budget",
        priority: "high",
      });
    }

    // Emergency fund warning
    if (finance.emergencyFundMonths < 3) {
      notifications.push({
        user_id: userId,
        title: "Emergency Fund Warning",
        body: `Your emergency fund covers only ${finance.emergencyFundMonths} months. Aim for 6 months of expenses.`,
        type: "emergency",
        priority: "high",
      });
    }

    // Health score alert
    if (finance.healthScore < 50) {
      notifications.push({
        user_id: userId,
        title: "Financial Health Needs Attention",
        body: `Your financial health score is ${finance.healthScore}/100. Review your savings and investment strategy.`,
        type: "health",
        priority: "medium",
      });
    }

    // Inflation warning
    if (finance.inflationIndex > 7) {
      notifications.push({
        user_id: userId,
        title: "High Personal Inflation",
        body: `Your personal inflation index is ${finance.inflationIndex}%, well above the national average. Review spending categories.`,
        type: "inflation",
        priority: "medium",
      });
    }

    // Investment reminder
    if (finance.monthlySavings > 5000) {
      notifications.push({
        user_id: userId,
        title: "Investment Reminder",
        body: `You have ₹${finance.monthlySavings.toLocaleString('en-IN')} in surplus savings. Consider investing it in a SIP.`,
        type: "investment",
        priority: "low",
      });
    }

    // Salary reminder (mid-month)
    const day = new Date().getDate();
    if (day >= 14 && day <= 16) {
      notifications.push({
        user_id: userId,
        title: "Salary Reminder",
        body: "Expect your salary soon. Plan your savings and investments for this month.",
        type: "salary",
        priority: "low",
      });
    }

    // Goal milestones
    if (finance.goalsProgress) {
      for (const goal of finance.goalsProgress) {
        if (goal.pct >= 50 && goal.pct < 55) {
          notifications.push({
            user_id: userId,
            title: "Goal Milestone: 50%!",
            body: `You've reached 50% of your "${goal.title}" goal. Keep going!`,
            type: "goal",
            priority: "low",
          });
        }
        if (goal.pct >= 90 && goal.pct < 95) {
          notifications.push({
            user_id: userId,
            title: "Goal Almost Complete!",
            body: `Your "${goal.title}" goal is ${Math.round(goal.pct)}% complete. Almost there!`,
            type: "goal",
            priority: "low",
          });
        }
      }
    }

    // Monthly report ready
    if (day >= 28) {
      notifications.push({
        user_id: userId,
        title: "Monthly Report Ready",
        body: "Your monthly financial report is available. Check the Reports section.",
        type: "report",
        priority: "low",
      });
    }

    return new Response(
      JSON.stringify({ notifications }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
