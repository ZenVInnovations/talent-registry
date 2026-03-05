import { cn } from '@/lib/utils';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS, JOB_STATUS_LABELS, JOB_STATUS_COLORS, EMPLOYER_VERIFICATION_LABELS, EMPLOYER_VERIFICATION_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  type?: 'application' | 'job' | 'employer';
  className?: string;
}

export function StatusBadge({ status, type = 'application', className }: StatusBadgeProps) {
  const labels = type === 'job' ? JOB_STATUS_LABELS : type === 'employer' ? EMPLOYER_VERIFICATION_LABELS : APPLICATION_STATUS_LABELS;
  const colors = type === 'job' ? JOB_STATUS_COLORS : type === 'employer' ? EMPLOYER_VERIFICATION_COLORS : APPLICATION_STATUS_COLORS;

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors[status] || 'bg-gray-100 text-gray-700', className)}>
      {labels[status] || status}
    </span>
  );
}
