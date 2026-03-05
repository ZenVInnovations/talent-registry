'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateApplication } from '@/hooks/useApplications';
import type { Job } from '@/lib/api/jobs';

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: Job;
}

export function ApplyModal({ open, onClose, job }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const { mutate: apply, isPending } = useCreateApplication();

  const handleSubmit = () => {
    apply(
      { jobId: job.id, coverLetter: coverLetter || undefined },
      { onSuccess: () => { setCoverLetter(''); onClose(); } },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={`Apply for ${job.title}`} description={job.employer?.companyName}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Cover Letter (optional)</label>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the employer why you're a great fit..."
            rows={5}
            maxLength={5000}
          />
          <p className="mt-1 text-xs text-muted-foreground">{coverLetter.length}/5000</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isPending}>Submit Application</Button>
        </div>
      </div>
    </Modal>
  );
}
