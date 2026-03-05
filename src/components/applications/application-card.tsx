'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Building2, Calendar } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { JOB_TYPE_LABELS } from '@/lib/constants';
import type { Application } from '@/lib/api/applications';

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Link href={`/applications/${application.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{application.job?.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{application.job?.employer?.companyName}</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{JOB_TYPE_LABELS[application.job?.type || ''] || application.job?.type}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied {formatRelativeTime(application.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <StatusBadge status={application.status} type="application" />
              {application.matchScoreAtApply !== null && (
                <span className="text-xs text-muted-foreground">
                  {application.matchScoreAtApply}% match
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
