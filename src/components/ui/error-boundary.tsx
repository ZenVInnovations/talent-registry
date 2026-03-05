'use client';

import { Component, type ReactNode } from 'react';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">{this.state.error?.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
