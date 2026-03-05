'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ value, onChange, options, placeholder = 'Select...', className }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(
    (opt) => !value.includes(opt) && opt.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        className="flex min-h-[40px] flex-wrap gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {v}
            <button onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== v)); }}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-muted-foreground py-0.5">{placeholder}</span>}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 self-center text-muted-foreground" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border-b border-border bg-transparent px-3 py-2 text-sm outline-none"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No options</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange([...value, opt]); setSearch(''); }}
                  className="w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
