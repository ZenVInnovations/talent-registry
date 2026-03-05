'use client';

import { useParams } from 'next/navigation';
import { useApplication } from '@/hooks/useApplications';
import { useUpdateApplicationStatus } from '@/hooks/useApplications';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ApplicationTimeline } from '@/components/applications/application-timeline';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Building2 } from 'lucide-react';
import { JOB_TYPE_LABELS, ALLOWED_TRANSITIONS } from '@/lib/constants';
import Link from 'next/link';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: app, isLoading } = useApplication(id);
  const { user } = useCurrentUser();
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!app) return <div className="py-12 text-center text-muted-foreground">Application not found</div>;

  const isOwner = app.profile?.userId === user?.id;
  const allowedNext = ALLOWED_TRANSITIONS[app.status] || [];
  const studentActions = allowedNext.filter((s) => ['WITHDRAWN', 'ACCEPTED', 'DECLINED_BY_STUDENT'].includes(s));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/applications" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{app.job?.title}</h1>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{app.job?.employer?.companyName}</span>
              <span className="text-xs">{JOB_TYPE_LABELS[app.job?.type || ''] || app.job?.type}</span>
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>
      </div>

      {isOwner && studentActions.length > 0 && (
        <div className="flex gap-2">
          {studentActions.map((action) => (
            <Button
              key={action}
              variant={action === 'WITHDRAWN' ? 'destructive' : action === 'ACCEPTED' ? 'primary' : 'outline'}
              size="sm"
              loading={isPending}
              onClick={() => updateStatus({ id: app.id, status: action })}
            >
              {action === 'WITHDRAWN' ? 'Withdraw' : action === 'ACCEPTED' ? 'Accept Offer' : 'Decline Offer'}
            </Button>
          ))}
        </div>
      )}

      {app.coverLetter && (
        <Card>
          <CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{app.coverLetter}</p></CardContent>
        </Card>
      )}

      {app.matchScoreAtApply !== null && (
        <Card>
          <CardHeader><CardTitle>Match Score at Time of Application</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{app.matchScoreAtApply}%</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
        <CardContent>
          <ApplicationTimeline application={app} />
        </CardContent>
      </Card>
    </div>
  );
}
