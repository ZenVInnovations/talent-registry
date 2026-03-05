'use client';

import { useEmployers } from '@/hooks/useEmployer';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spinner } from '@/components/ui/spinner';
import { Briefcase, Users, FileText, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function EmployerDashboard() {
  useCurrentUser();
  const { data: employers, isLoading } = useEmployers();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const employer = employers?.data[0];
  if (!employer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">Welcome to the Employer Portal</h1>
        <p className="mt-2 text-muted-foreground">Register your company to start posting jobs and hiring talent.</p>
        <Link href="/employer/register" className="mt-6">
          <Button size="lg">Register Company</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{employer.companyName}</h1>
          <StatusBadge status={employer.verificationStatus} type="employer" />
        </div>
        <Link href="/employer/jobs/new">
          <Button>Post New Job</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Jobs', icon: Briefcase, href: '/employer/jobs', value: employer._count?.jobs ?? '-' },
          { label: 'Talent', icon: Users, href: '/employer/talent', value: 'Browse' },
          { label: 'Applications', icon: FileText, href: '/employer/jobs', value: 'View' },
          { label: 'Placements', icon: CheckSquare, href: '/employer/placements', value: 'View' },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
