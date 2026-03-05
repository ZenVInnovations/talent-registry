'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, description, className, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg animate-in fade-in-0 zoom-in-95',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {title && (
          <div className="mb-4">
            <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
