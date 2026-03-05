import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'outline';
  className?: string;
}

const variants = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  outline: 'border border-border text-foreground',
};

export function Tag({ children, variant = 'default', className }: TagProps) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
