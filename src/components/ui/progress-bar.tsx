import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

function getColor(pct: number) {
  if (pct >= 80) return 'bg-success';
  if (pct >= 60) return 'bg-primary';
  if (pct >= 40) return 'bg-warning';
  return 'bg-destructive';
}

export function ProgressBar({ value, max = 100, label, showValue, className }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1 flex justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-medium">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', getColor(pct))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
