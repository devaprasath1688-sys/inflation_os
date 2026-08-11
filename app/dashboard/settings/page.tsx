'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Moon, Sun, Bell, Globe, Shield, Save, Check, Eye, EyeOff, Coins } from 'lucide-react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { useDashboard } from '@/components/dashboard/dashboard-context';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
];

const LANGUAGES = ['English', 'हिन्दी', 'Español', 'Français', 'Deutsch', '日本語', '中文', 'العربية'];

interface UserSettings {
  theme: string;
  language: string;
  currency: string;
  email_notifications: boolean;
  push_notifications: boolean;
  budget_alerts: boolean;
  goal_milestones: boolean;
  privacy_mode: boolean;
}

export default function SettingsPage() {
  const { profile } = useDashboard();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwd, setPwd] = useState({ next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'English',
    currency: 'INR',
    email_notifications: true,
    push_notifications: true,
    budget_alerts: true,
    goal_milestones: true,
    privacy_mode: false,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const s = data as UserSettings & { id: string; user_id: string };
          setSettings({
            theme: s.theme,
            language: s.language,
            currency: s.currency,
            email_notifications: s.email_notifications,
            push_notifications: s.push_notifications,
            budget_alerts: s.budget_alerts,
            goal_milestones: s.goal_milestones,
            privacy_mode: s.privacy_mode,
          });
          if (s.theme !== theme) setTheme(s.theme as 'light' | 'dark');
        }
      });
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ display_name: name }).eq('id', user?.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePassword = async () => {
    setPwdMsg(null);
    if (pwd.next !== pwd.confirm) {
      setPwdMsg('Passwords do not match.');
      return;
    }
    if (pwd.next.length < 6) {
      setPwdMsg('Password must be at least 6 characters.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    if (error) setPwdMsg(error.message);
    else {
      setPwdMsg('Password updated successfully.');
      setPwd({ next: '', confirm: '' });
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSettingsSaving(true);
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      ...settings,
    });
    setSettingsSaving(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const toggleSetting = (key: keyof UserSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') setTheme(value as 'light' | 'dark');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, security, and preferences.</p>
      </div>

      {/* Profile */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Profile</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
            <Input value={user?.email ?? ''} disabled className="opacity-60" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </GlassCard>

      {/* Security */}
      <GlassCard delay={0.05}>
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Security</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New Password</label>
            <Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirm Password</label>
            <Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} placeholder="••••••••" />
          </div>
          <div className="flex items-end">
            <Button onClick={handlePassword} className="gap-2">
              <Shield className="h-4 w-4" />
              Update Password
            </Button>
          </div>
        </div>
        {pwdMsg && <p className="mt-3 text-sm text-muted-foreground">{pwdMsg}</p>}
      </GlassCard>

      {/* Appearance */}
      <GlassCard delay={0.1}>
        <div className="mb-4 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
          <h3 className="font-display text-lg font-semibold">Appearance</h3>
        </div>
        <div className="flex items-center justify-between rounded-xl glass p-4">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
          </div>
          <Switch checked={settings.theme === 'dark'} onCheckedChange={(c) => toggleSetting('theme', c ? 'dark' : 'light')} />
        </div>
      </GlassCard>

      {/* Currency */}
      <GlassCard delay={0.15}>
        <div className="mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Currency</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => toggleSetting('currency', c.code)}
              className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${settings.currency === c.code ? 'bg-gradient-to-r from-primary/15 to-secondary/10 ring-2 ring-primary/40' : 'glass hover:shadow-md'}`}
            >
              <span className="text-lg font-bold">{c.symbol}</span>
              <div>
                <p className="text-sm font-medium">{c.code}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Language */}
      <GlassCard delay={0.2}>
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Language</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleSetting('language', lang)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${settings.language === lang ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'glass hover:shadow-md'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard delay={0.25}>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'email_notifications' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'push_notifications' as const, label: 'Push Notifications', desc: 'In-app push alerts' },
            { key: 'budget_alerts' as const, label: 'Budget Alerts', desc: 'Warn when budget is exceeded' },
            { key: 'goal_milestones' as const, label: 'Goal Milestones', desc: 'Celebrate goal progress' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl glass p-4">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(c) => toggleSetting(item.key, c)}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Privacy */}
      <GlassCard delay={0.3}>
        <div className="mb-4 flex items-center gap-2">
          {settings.privacy_mode ? <EyeOff className="h-5 w-5 text-primary" /> : <Eye className="h-5 w-5 text-primary" />}
          <h3 className="font-display text-lg font-semibold">Privacy Controls</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl glass p-4">
            <div>
              <p className="text-sm font-medium">Privacy Mode</p>
              <p className="text-xs text-muted-foreground">Hide sensitive financial values in the UI</p>
            </div>
            <Switch checked={settings.privacy_mode} onCheckedChange={(c) => toggleSetting('privacy_mode', c)} />
          </div>
          <div className="flex items-center justify-between rounded-xl glass p-4">
            <div>
              <p className="text-sm font-medium">Data Sharing</p>
              <p className="text-xs text-muted-foreground">Your data is never shared with third parties</p>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Protected</span>
          </div>
        </div>
      </GlassCard>

      {/* Save settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={settingsSaving} className="gap-2">
          {settingsSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {settingsSaved ? 'Settings Saved!' : settingsSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
