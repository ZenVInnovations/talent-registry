import { cn } from '@/lib/utils';

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ className, children }: TableProps) {
  return <thead className={cn('[&_tr]:border-b', className)}>{children}</thead>;
}

export function TableBody({ className, children }: TableProps) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)}>{children}</tbody>;
}

export function TableRow({ className, children }: TableProps) {
  return (
    <tr className={cn('border-b border-border transition-colors hover:bg-muted/50', className)}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children }: TableProps) {
  return (
    <th className={cn('h-10 px-4 text-left align-middle font-medium text-muted-foreground', className)}>
      {children}
    </th>
  );
}

export function TableCell({ className, children }: TableProps) {
  return <td className={cn('p-4 align-middle', className)}>{children}</td>;
}
