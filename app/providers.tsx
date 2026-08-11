'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { MouseGlow } from '@/components/landing/mouse-glow';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MouseGlow />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
