'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Sun, Moon, Search, Check } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-destructive',
  medium: 'bg-warning',
  low: 'bg-success',
};

export function Topbar({ onMenuClick, notifications, onMarkRead }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass-strong px-4 sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search insights, goals, reports..."
          className="h-10 w-full rounded-xl glass pl-10 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
        />
      </div>
      <div className="flex-1 sm:hidden" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl glass transition-all hover:shadow-md"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Moon className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sun className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl glass transition-all hover:shadow-md"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl glass-strong shadow-2xl"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="font-semibold">Notifications</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      className={cn(
                        'flex w-full gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-primary/5',
                        !n.read && 'bg-primary/5'
                      )}
                    >
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', PRIORITY_COLORS[n.priority] ?? 'bg-muted')} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      </div>
                      {n.read && <Check className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
