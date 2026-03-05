'use client';

import { useAnalyticsSummary } from '@/hooks/useAnalytics';
import { useEmployers } from '@/hooks/useEmployer';
import { AnalyticsSummaryGrid } from '@/components/admin/analytics-summary';
import { EmployerVerificationCard } from '@/components/admin/employer-verification-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: summary, isLoading } = useAnalyticsSummary();
  const { data: pendingEmployers } = useEmployers({ status: 'PENDING', limit: 5 });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {summary && <AnalyticsSummaryGrid data={summary} />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Verifications</CardTitle>
          <Link href="/admin/employers/verification">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {!pendingEmployers?.data.length ? (
            <p className="text-sm text-muted-foreground">No pending verifications</p>
          ) : (
            pendingEmployers.data.map((emp) => (
              <EmployerVerificationCard key={emp.id} employer={emp} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
