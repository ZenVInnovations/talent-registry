'use client';

import { useParams } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import { PipelineBoard } from '@/components/employer/pipeline-board';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(id);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!job) return <div className="py-12 text-center text-muted-foreground">Job not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/employer/jobs/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {job.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Applications for {job.title}</h1>
      </div>
      <PipelineBoard jobId={id} />
    </div>
  );
}
