'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useFilters<T extends Record<string, string>>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = Object.fromEntries(searchParams.entries()) as T;

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { filters, setFilter, clearFilters };
}
