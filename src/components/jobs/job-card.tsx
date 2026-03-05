'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tag } from '@/components/ui/tag';
import { ScoreRing } from '@/components/ui/score-ring';
import { MapPin, Clock, Building2 } from 'lucide-react';
import { JOB_TYPE_LABELS } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import type { Job } from '@/lib/api/jobs';

interface JobCardProps {
  job: Job;
  matchScore?: number;
}

export function JobCard({ job, matchScore }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{job.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{job.employer?.companyName}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {JOB_TYPE_LABELS[job.type] || job.type}
                </span>
                {job.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                    {job.remote && ' (Remote)'}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {job.requiredSkills.slice(0, 4).map((skill) => (
                  <Tag key={skill} variant="primary">{skill}</Tag>
                ))}
                {job.requiredSkills.length > 4 && (
                  <Tag>+{job.requiredSkills.length - 4}</Tag>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {matchScore !== undefined && <ScoreRing score={matchScore} size="sm" />}
              <StatusBadge status={job.status} type="job" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{job.openPositions} position{job.openPositions !== 1 ? 's' : ''}</span>
            <span>{formatRelativeTime(job.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
