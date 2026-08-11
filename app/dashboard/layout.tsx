'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { AIChatAssistant } from '@/components/dashboard/ai-chat-assistant';
import { DashboardProvider } from '@/components/dashboard/dashboard-context';
import { PageTransition } from '@/components/dashboard/page-transition';
import { ParticleBackground } from '@/components/landing/particle-background';
import { DashboardSkeleton } from '@/components/dashboard/skeleton';
import { useAuth } from '@/lib/auth-context';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const data = useDashboardData();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (!data.loading && (!data.profile || !data.profile.onboarded)) {
    router.replace('/onboarding');
    return null;
  }

  return (
    <DashboardProvider value={data}>
      <div className="relative min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
            notifications={data.notifications}
            onMarkRead={data.markNotificationRead}
          />
          <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-grid">
            <ParticleBackground count={10} />
            <div className="relative z-10">
              {data.loading ? (
                <DashboardSkeleton />
              ) : (
                <PageTransition>{children}</PageTransition>
              )}
            </div>
          </main>
        </div>
        <AIChatAssistant />
      </div>
    </DashboardProvider>
  );
}
