'use client';

import { createContext, useContext } from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-data';

type DashboardData = ReturnType<typeof useDashboardData>;

const DashboardContext = createContext<DashboardData | null>(null);

export function DashboardProvider({ value, children }: { value: DashboardData; children: React.ReactNode }) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardData {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardLayout');
  return ctx;
}
