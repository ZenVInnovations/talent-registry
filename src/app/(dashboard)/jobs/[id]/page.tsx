'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import { useMatch } from '@/hooks/useMatch';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { JobDetailHeader } from '@/components/jobs/job-detail-header';
import { MatchExplanation } from '@/components/jobs/match-explanation';
import { ApplyModal } from '@/components/applications/apply-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(id);
  const { user, isStudent } = useCurrentUser();
  const { data: match } = useMatch(id, user?.id || '');
  const [applyOpen, setApplyOpen] = useState(false);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!job) return <div className="py-12 text-center text-muted-foreground">Job not found</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>

      <JobDetailHeader job={job} matchScore={match?.overallScore} />

      {isStudent && job.status === 'ACTIVE' && (
        <Button onClick={() => setApplyOpen(true)} size="lg" className="w-full sm:w-auto">
          Apply Now
        </Button>
      )}

      <Card>
        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: job.description }} />
        </CardContent>
      </Card>

      {match && <MatchExplanation match={match} />}

      {job && <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} job={job} />}
    </div>
  );
}
