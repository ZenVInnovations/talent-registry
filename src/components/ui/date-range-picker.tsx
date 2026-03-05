'use client';

import { Input } from './input';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  className?: string;
}

export function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, className }: DateRangePickerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input type="date" value={startDate} onChange={(e) => onStartChange(e.target.value)} className="w-auto" />
      <span className="text-sm text-muted-foreground">to</span>
      <Input type="date" value={endDate} onChange={(e) => onEndChange(e.target.value)} className="w-auto" />
    </div>
  );
}
