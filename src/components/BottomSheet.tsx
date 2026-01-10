import React, { useEffect } from 'react';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="sheet-enter w-full rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs focus-ring"
          >
            Close
          </button>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
