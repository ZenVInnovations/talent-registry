'use client';

import { useParams } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import { JobDetailHeader } from '@/components/jobs/job-detail-header';
import { JobStatusControl } from '@/components/employer/job-status-control';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(id);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!job) return <div className="py-12 text-center text-muted-foreground">Job not found</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/employer/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>

      <JobDetailHeader job={job} />
      <JobStatusControl jobId={job.id} currentStatus={job.status} />

      <Card>
        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: job.description }} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href={`/employer/jobs/${job.id}/applications`}>
          <Button variant="outline">View Applications</Button>
        </Link>
      </div>
    </div>
  );
}
