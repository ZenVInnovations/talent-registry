'use client';

import { useState } from 'react';
import { useAnalyticsSummary, useApplicationMetrics, usePlacementMetrics, useSkillDemand } from '@/hooks/useAnalytics';
import { AnalyticsSummaryGrid } from '@/components/admin/analytics-summary';
import { SkillDemandChart } from '@/components/admin/skill-demand-chart';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { BarChart3 } from 'lucide-react';
import type { ApplicationDailyRecord, PlacementMonthlyRecord } from '@/lib/api/analytics';

function aggregateBy<T>(records: T[], key: keyof T): Record<string, number> {
  const result: Record<string, number> = {};
  for (const r of records) {
    const k = String(r[key]);
    result[k] = (result[k] || 0) + ((r as Record<string, number>).count || 1);
  }
  return result;
}

function BarChartSection({ data, color }: { data: Record<string, number>; color: string }) {
  const entries = Object.entries(data);
  if (!entries.length) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  const maxCount = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="space-y-2">
      {entries.map(([label, count]) => (
        <div key={label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{label}</span><span className="font-medium">{count}</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded bg-muted">
            <div className={`h-full rounded ${color}`} style={{ width: `${(count / maxCount) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const analyticsTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'applications', label: 'Applications' },
  { value: 'placements', label: 'Placements' },
  { value: 'skills', label: 'Skills' },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState('overview');
  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
  const { data: appRecords } = useApplicationMetrics();
  const { data: placeRecords } = usePlacementMetrics();
  const { data: skillRecords } = useSkillDemand();

  if (loadingSummary) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const appByDomain = appRecords ? aggregateBy<ApplicationDailyRecord>(appRecords, 'domain') : {};
  const appByInstitution = appRecords ? aggregateBy<ApplicationDailyRecord>(appRecords, 'institution') : {};
  const placesBySector = placeRecords ? aggregateBy<PlacementMonthlyRecord>(placeRecords, 'sector') : {};
  const placesByType = placeRecords ? aggregateBy<PlacementMonthlyRecord>(placeRecords, 'type') : {};

  const topSkills = skillRecords
    ? skillRecords.map((s) => ({ skill: s.skill, demand: s.demandCount, supply: s.supplyCount }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <Tabs value={tab} onValueChange={setTab} tabs={analyticsTabs} />

      {tab === 'overview' && summary && <AnalyticsSummaryGrid data={summary} />}

      {tab === 'applications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Applications by Domain</CardTitle></CardHeader>
            <CardContent>
              <BarChartSection data={appByDomain} color="bg-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Applications by Institution</CardTitle></CardHeader>
            <CardContent>
              <BarChartSection data={appByInstitution} color="bg-info" />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'placements' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Placements by Sector</CardTitle></CardHeader>
            <CardContent>
              <BarChartSection data={placesBySector} color="bg-success" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Placements by Type</CardTitle></CardHeader>
            <CardContent>
              <BarChartSection data={placesByType} color="bg-warning" />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'skills' && (
        <Card>
          <CardHeader><CardTitle>Top Skills Demand vs Supply</CardTitle></CardHeader>
          <CardContent>
            {topSkills.length ? (
              <SkillDemandChart skills={topSkills} />
            ) : (
              <EmptyState icon={BarChart3} title="No data" description="Skill demand data will appear here." />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
