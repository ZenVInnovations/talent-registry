'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}: {value}
      <button onClick={onRemove} className="hover:text-primary/70" aria-label={`Remove ${label} filter`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
