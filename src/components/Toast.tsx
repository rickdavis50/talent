import React from 'react';

type ToastProps = {
  message: string;
  visible: boolean;
};

const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  return (
    <div
      className={`fixed right-6 top-6 z-50 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-xs text-[var(--color-text)] shadow-glow transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default Toast;
