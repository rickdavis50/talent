import React, { useEffect, useRef } from 'react';

import AppButton from './AppButton';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, actions }) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const preferred = dialogRef.current?.querySelector<HTMLElement>(
      '[data-autofocus], input, select, textarea'
    );
    const fallback = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    (preferred ?? fallback)?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{title}</div>
          <AppButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-full"
          >
            x
          </AppButton>
        </div>
        <div className="mt-4 text-sm text-[var(--color-text)]">{children}</div>
        {actions ? <div className="mt-6 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
