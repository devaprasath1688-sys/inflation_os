'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Shield, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  if (loading) {
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

  // Check admin role from user app metadata
  const adminEmails = ['admin@inflationos.app', 'admin@inflationos.com'];
  if (!adminEmails.includes(user.email ?? '')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-grid p-6">
        <Shield className="h-12 w-12 text-destructive" />
        <h1 className="font-display text-2xl font-bold">Access Denied</h1>
        <p className="text-sm text-muted-foreground">You need admin privileges to access this area.</p>
        <Link href="/dashboard" className="rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border glass-strong px-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-destructive to-warning shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold">
            InflationOS <span className="text-destructive">Admin</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            User Dashboard
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>
      <main className="bg-grid">{children}</main>
    </div>
  );
}
