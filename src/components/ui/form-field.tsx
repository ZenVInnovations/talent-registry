import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, required, description, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
