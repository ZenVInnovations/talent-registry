import { cn } from '@/lib/utils';

interface FunnelChartProps {
  stages: { label: string; count: number; percentage: number }[];
  className?: string;
}

export function FunnelChart({ stages, className }: FunnelChartProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className={cn('space-y-3', className)}>
      {stages.map((stage) => (
        <div key={stage.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{stage.label}</span>
            <span className="font-medium">{stage.count} ({stage.percentage}%)</span>
          </div>
          <div className="h-6 w-full overflow-hidden rounded bg-muted">
            <div
              className="h-full rounded bg-primary transition-all"
              style={{ width: `${(stage.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
