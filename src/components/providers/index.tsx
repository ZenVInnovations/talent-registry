'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { ToastProvider } from '@/components/ui/toast';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore();

  // Hydrate theme from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    setTheme(saved || 'system');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply theme class whenever theme changes
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, setTheme]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
