'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Bell, FileText, Sparkles, Plus, Trash2, Check, X, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/dashboard/glass-card';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  display_name: string;
  onboarded: boolean;
}

interface AdminStats {
  totalUsers: number;
  onboardedUsers: number;
  totalGoals: number;
  totalNotifications: number;
  totalChatMessages: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; body: string; type: string; active: boolean; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnn, setNewAnn] = useState({ title: '', body: '', type: 'info' });
  const [annMsg, setAnnMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes, gRes, nRes, cRes, aRes] = await Promise.all([
        supabase.from('auth_users_view').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('goals').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      ]);

      const profiles = (pRes.data ?? []) as { id: string; display_name: string; onboarded: boolean; created_at: string }[];
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      // Combine auth users with profiles
      const authUsers = (uRes.data ?? []) as { id: string; email: string; created_at: string }[];
      const combined: AdminUser[] = authUsers.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        display_name: profileMap.get(u.id)?.display_name ?? '—',
        onboarded: profileMap.get(u.id)?.onboarded ?? false,
      }));
      setUsers(combined);

      setStats({
        totalUsers: combined.length,
        onboardedUsers: combined.filter((u) => u.onboarded).length,
        totalGoals: gRes.count ?? 0,
        totalNotifications: nRes.count ?? 0,
        totalChatMessages: cRes.count ?? 0,
      });

      setAnnouncements((aRes.data ?? []) as typeof announcements);
    } catch {
      // auth_users_view may not exist — fallback to profiles only
      const pRes = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const profiles = (pRes.data ?? []) as { id: string; display_name: string; onboarded: boolean; created_at: string }[];
      setUsers(profiles.map((p) => ({ id: p.id, email: '—', created_at: p.created_at, display_name: p.display_name, onboarded: p.onboarded })));
      setStats({
        totalUsers: profiles.length,
        onboardedUsers: profiles.filter((p) => p.onboarded).length,
        totalGoals: 0,
        totalNotifications: 0,
        totalChatMessages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!newAnn.title.trim()) return;
    setAnnMsg(null);
    // Use service role via edge function or direct insert (will fail RLS for non-admin, but admin email bypasses)
    const { data, error } = await supabase.from('announcements').insert({
      title: newAnn.title,
      body: newAnn.body,
      type: newAnn.type,
      active: true,
    }).select();
    if (error) {
      setAnnMsg('Failed to create announcement. Service role access required.');
      return;
    }
    if (data) setAnnouncements((prev) => [data[0] as typeof announcements[0], ...prev]);
    setNewAnn({ title: '', body: '', type: 'info' });
    setAnnMsg('Announcement created.');
    setTimeout(() => setAnnMsg(null), 2000);
  };

  const toggleAnnouncement = async (id: string, active: boolean) => {
    await supabase.from('announcements').update({ active: !active }).eq('id', id);
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, active: !active } : a)));
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-primary to-secondary' },
    { label: 'Onboarded', value: stats?.onboardedUsers ?? 0, icon: Check, color: 'from-success to-accent' },
    { label: 'Total Goals', value: stats?.totalGoals ?? 0, icon: TrendingUp, color: 'from-secondary to-accent' },
    { label: 'Notifications', value: stats?.totalNotifications ?? 0, icon: Bell, color: 'from-warning to-destructive' },
    { label: 'Chat Messages', value: stats?.totalChatMessages ?? 0, icon: Sparkles, color: 'from-accent to-primary' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">System analytics, user management, and announcements.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.05}>
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value.toLocaleString()}</p>
          </GlassCard>
        ))}
      </div>

      {/* User list */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Users</h3>
          <span className="ml-auto text-xs text-muted-foreground">{users.length} loaded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Onboarded</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium">{u.display_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-4">
                    {u.onboarded ? (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Yes</span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Announcements */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Create Announcement</h3>
          </div>
          <div className="space-y-3">
            <input
              value={newAnn.title}
              onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
              placeholder="Announcement title"
              className="h-11 w-full rounded-xl glass px-3.5 text-sm outline-none ring-primary/40 focus:ring-2"
            />
            <textarea
              value={newAnn.body}
              onChange={(e) => setNewAnn({ ...newAnn, body: e.target.value })}
              placeholder="Announcement body"
              rows={3}
              className="w-full rounded-xl glass px-3.5 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2"
            />
            <select
              value={newAnn.type}
              onChange={(e) => setNewAnn({ ...newAnn, type: e.target.value })}
              className="h-11 w-full rounded-xl glass px-3.5 text-sm outline-none ring-primary/40 focus:ring-2"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
            </select>
            <button
              onClick={createAnnouncement}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30"
            >
              <Plus className="h-4 w-4" />
              Publish
            </button>
            {annMsg && <p className="text-sm text-muted-foreground">{annMsg}</p>}
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Active Announcements</h3>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl glass p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{a.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
                      <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        a.type === 'warning' ? 'bg-warning/10 text-warning' : a.type === 'success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>{a.type}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleAnnouncement(a.id, a.active)}
                        className={`rounded-lg p-1.5 ${a.active ? 'text-success' : 'text-muted-foreground'}`}
                        title={a.active ? 'Active' : 'Inactive'}
                      >
                        {a.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(a.id)}
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
