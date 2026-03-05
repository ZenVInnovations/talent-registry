'use client';

import { Modal } from './modal';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'primary', loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button variant={variant === 'destructive' ? 'destructive' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
