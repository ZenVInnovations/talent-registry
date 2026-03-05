'use client';

import { StatusBadge } from '@/components/ui/status-badge';
import { Tag } from '@/components/ui/tag';
import { ScoreRing } from '@/components/ui/score-ring';
import { Building2, MapPin, Clock, Calendar, DollarSign } from 'lucide-react';
import { JOB_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Job } from '@/lib/api/jobs';

interface JobDetailHeaderProps {
  job: Job;
  matchScore?: number;
}

export function JobDetailHeader({ job, matchScore }: JobDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{job.employer?.companyName}</span>
            <StatusBadge status={job.status} type="job" />
          </div>
        </div>
        {matchScore !== undefined && (
          <div className="text-center shrink-0">
            <ScoreRing score={matchScore} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">Match Score</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {JOB_TYPE_LABELS[job.type] || job.type}
        </span>
        {job.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location}{job.remote ? ' (Remote)' : ''}
          </span>
        )}
        {job.salaryRange && (
          <span className="inline-flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()} {job.salaryRange.currency}
          </span>
        )}
        {job.closesAt && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Closes {formatDate(job.closesAt)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {job.requiredSkills.map((s) => <Tag key={s} variant="primary">{s}</Tag>)}
          </div>
        </div>
        {job.preferredSkills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Preferred Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.preferredSkills.map((s) => <Tag key={s}>{s}</Tag>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
