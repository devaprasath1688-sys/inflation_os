'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useDashboard } from './dashboard-context';
import { generateLocalResponse } from '@/lib/ai-engine';
import type { ChatMessage } from '@/lib/types';

const SUGGESTIONS = [
  'Can I buy a car next year?',
  'Can I retire at 55?',
  'Should I invest in SIP?',
  'How much should I save monthly?',
  'How does inflation affect me?',
  'Can I buy a house in 5 years?',
  'How is my financial health?',
  'How do I reduce my debt?',
];

export function AIChatAssistant() {
  const { user } = useAuth();
  const { finance, onboarding, goals } = useDashboard();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) setMessages(data as ChatMessage[]);
        else setMessages([{
          id: 'welcome',
          user_id: user.id,
          role: 'assistant',
          content: 'Hi! I am your AI financial assistant. I analyze your salary, expenses, savings, investments, loans, and goals to give personalized advice. Ask me anything!',
          created_at: new Date().toISOString(),
        }]);
      });
  }, [user, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    if (!finance) return undefined;
    return {
      monthlyIncome: finance.monthlyIncome,
      monthlyExpenses: finance.monthlyExpenses,
      monthlySavings: finance.monthlySavings,
      netWorth: finance.netWorth,
      healthScore: finance.financialHealthScore,
      inflationIndex: finance.personalInflationIndex,
      investmentValue: finance.investmentValue,
      emergencyFundMonths: finance.emergencyFund.monthsCovered,
      age: onboarding?.personal.age,
      loans: onboarding?.lifestyle.loans,
      emis: onboarding?.lifestyle.emis,
      savingsRate: finance.savingsRate,
      debtToIncomeRatio: finance.debtToIncomeRatio,
      goals: goals.map((g) => ({
        title: g.title,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        deadline: g.deadline,
      })),
      expenseBreakdown: finance.expenseBreakdown,
    };
  };

  const send = async (text: string) => {
    if (!text.trim() || !user) return;
    setInput('');
    setLoading(true);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    await supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: text });

    let aiResponse: string;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        } as Record<string, string>,
        body: JSON.stringify({
          message: text,
          financialContext: buildContext(),
        }),
      });

      if (!response.ok) throw new Error('unavailable');
      const data = await response.json();
      aiResponse = data.response ?? generateLocalResponse(text, { finance, onboarding, goals });
    } catch {
      // Edge function unreachable — use local engine (works fully offline)
      aiResponse = generateLocalResponse(text, { finance, onboarding, goals });
    }

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: 'assistant',
      content: aiResponse,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    await supabase.from('chat_messages').insert({ user_id: user.id, role: 'assistant', content: aiResponse });
    setLoading(false);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-2xl shadow-primary/40 transition-transform hover:scale-110"
        aria-label="AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <Bot className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary to-secondary opacity-50 blur-lg animate-pulse-glow" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl glass-strong shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-xs text-success">● Online</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-gradient-to-br from-primary to-secondary text-white' : 'glass'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">Analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full glass px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your finances..."
                  className="h-10 flex-1 rounded-xl glass px-3.5 text-sm outline-none ring-primary/40 focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white transition-transform hover:scale-105 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
