'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'right', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
  children: ReactNode;
}

export function DropdownItem({ onClick, className, destructive, children }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent',
        destructive && 'text-destructive hover:bg-destructive/10',
        className,
      )}
    >
      {children}
    </button>
  );
}
