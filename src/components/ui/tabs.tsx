'use client';

import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { value: string; label: string; count?: number }[];
  className?: string;
}

export function Tabs({ value, onValueChange, tabs, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-border', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
