'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PieChart, TrendingUp, Target, Shield,
  Calculator, Sparkles, Bot, FileText, Settings, LogOut, X, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Spending', href: '/dashboard/spending', icon: PieChart },
  { label: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
  { label: 'Goals', href: '/dashboard/goals', icon: Target },
  { label: 'Emergency Fund', href: '/dashboard/emergency', icon: Shield },
  { label: 'What-If', href: '/dashboard/simulator', icon: Calculator },
  { label: 'Future Wealth', href: '/dashboard/future', icon: TrendingUp },
  { label: 'Retirement', href: '/dashboard/retirement', icon: Sparkles },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const ADMIN_EMAILS = ['admin@inflationos.app', 'admin@inflationos.com'];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col glass-strong border-r border-border transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">
              Inflation<span className="text-gradient">OS</span>
            </span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active ? 'text-foreground' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 to-secondary/10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn('relative h-4 w-4', active && 'text-primary')} />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="space-y-1 border-t border-border p-3">
          {ADMIN_EMAILS.includes(user?.email ?? '') && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
