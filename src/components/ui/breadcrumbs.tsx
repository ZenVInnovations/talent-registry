import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center gap-1 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground">{item.label}</Link>
          ) : (
            <span className="font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
