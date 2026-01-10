import React from 'react';

type TopBarProps = {
  onReset: () => void;
  onDownload: () => void;
  editMode: boolean;
  onToggleEdit: () => void;
};

const TopBar: React.FC<TopBarProps> = ({
  onReset,
  onDownload,
  editMode,
  onToggleEdit,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="text-4xl font-semibold font-display">Top Talent Assessment</div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Adjust each signal to see real-time strengths and gaps.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleEdit}
          className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]/60 focus-ring"
        >
          {editMode ? 'Done' : 'Edit'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]/60 focus-ring"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]/60 focus-ring"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default TopBar;
