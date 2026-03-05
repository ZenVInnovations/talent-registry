'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardPage() {
  const router = useRouter();
  const { isAdmin, isBD, isEmployer, isStudent, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    if (isAdmin || isBD) {
      router.replace('/admin');
    } else if (isEmployer) {
      router.replace('/employer');
    } else {
      router.replace('/jobs');
    }
  }, [isAdmin, isBD, isEmployer, isStudent, isLoading, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
