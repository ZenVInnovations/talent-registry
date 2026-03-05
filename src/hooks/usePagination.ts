'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function usePagination() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;

  const setPage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(newPage));
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return { page, setPage };
}
