'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { computeFinance, type ComputedFinance } from '@/lib/finance';
import type { OnboardingData, Goal, Notification, Profile } from '@/lib/types';

interface DashboardData {
  loading: boolean;
  profile: Profile | null;
  onboarding: OnboardingData | null;
  goals: Goal[];
  notifications: Notification[];
  finance: ComputedFinance | null;
  refresh: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updateGoals: (goals: Goal[]) => void;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [finance, setFinance] = useState<ComputedFinance | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pRes, fRes, gRes, nRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('financial_profiles').select('data').eq('user_id', user.id).maybeSingle(),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      const prof = pRes.data as Profile | null;
      const fin = fRes.data as { data: OnboardingData } | null;
      setProfile(prof);
      const ob = fin?.data ?? null;
      setOnboarding(ob);
      setGoals((gRes.data as Goal[]) ?? []);
      setNotifications((nRes.data as Notification[]) ?? []);
      if (ob) setFinance(computeFinance(ob));
    } catch {
      // silent — UI shows empty state
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markNotificationRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const updateGoals = useCallback((g: Goal[]) => setGoals(g), []);

  return { loading, profile, onboarding, goals, notifications, finance, refresh, markNotificationRead, updateGoals };
}
