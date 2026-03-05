'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  data: unknown;
  title?: string;
  collapsible?: boolean;
  className?: string;
}

export function CodeBlock({ data, title, collapsible = false, className }: CodeBlockProps) {
  const [expanded, setExpanded] = useState(!collapsible);
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-md border border-border bg-muted/50', className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <button
            onClick={() => collapsible && setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
          >
            {collapsible && (expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)}
            {title}
          </button>
          <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground" aria-label="Copy">
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {expanded && (
        <pre className="overflow-x-auto p-3 text-xs font-mono text-foreground">
          {json}
        </pre>
      )}
    </div>
  );
}
