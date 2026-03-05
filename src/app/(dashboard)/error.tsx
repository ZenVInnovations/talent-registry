'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-xl font-bold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{error.message}</p>
      <Button variant="outline" className="mt-6" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
