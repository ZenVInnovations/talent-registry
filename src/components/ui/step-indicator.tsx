import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <nav className={cn('flex items-center', className)} aria-label="Progress">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          {i > 0 && (
            <div className={cn('mx-2 h-px w-8 sm:w-12', i <= currentStep ? 'bg-primary' : 'bg-border')} />
          )}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                i < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i === currentStep
                    ? 'border-2 border-primary text-primary'
                    : 'border-2 border-border text-muted-foreground',
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('hidden text-sm sm:block', i === currentStep ? 'font-medium' : 'text-muted-foreground')}>
              {step}
            </span>
          </div>
        </div>
      ))}
    </nav>
  );
}
