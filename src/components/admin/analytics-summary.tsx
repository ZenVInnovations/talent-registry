'use client';

import { StatCard } from '@/components/ui/stat-card';
import { Briefcase, Building2, FileText, CheckSquare, Users, Clock } from 'lucide-react';
import type { AnalyticsSummary } from '@/lib/api/analytics';

interface AnalyticsSummaryGridProps {
  data: AnalyticsSummary;
}

export function AnalyticsSummaryGrid({ data }: AnalyticsSummaryGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total Applications" value={data.totalApplications} icon={FileText} />
      <StatCard label="Total Placements" value={data.totalPlacements} icon={CheckSquare} />
      <StatCard label="Active Jobs" value={data.activeJobs} icon={Briefcase} />
      <StatCard label="Total Employers" value={data.totalEmployers} icon={Building2} />
      <StatCard label="Total Jobs" value={data.totalJobs} icon={Users} />
      <StatCard label="Pending Verifications" value={data.pendingVerifications} icon={Clock} />
    </div>
  );
}
