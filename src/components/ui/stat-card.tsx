import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs', trend.value >= 0 ? 'text-success' : 'text-destructive')}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
