'use client';

import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

const styles = {
  default: 'border-border bg-card',
  success: 'border-success/30 bg-success/10',
  error: 'border-destructive/30 bg-destructive/10',
  warning: 'border-warning/30 bg-warning/10',
};

export function ToastProvider() {
  const { toasts, removeToast } = useUIStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5',
              styles[toast.variant],
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description && <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
