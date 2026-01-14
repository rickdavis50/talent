import React from 'react';

import AppSlider from './AppSlider';

type SliderRowProps = {
  id: string;
  label: string;
  helper: string;
  value: number;
  onChange: (value: number) => void;
  editMode: boolean;
  onLabelChange: (value: string) => void;
  index: number;
};

const SliderRow: React.FC<SliderRowProps> = ({
  id,
  label,
  value,
  onChange,
  editMode,
  onLabelChange,
  index,
}) => {
  const status =
    value >= 5 ? 'completed' : value > 0 ? 'in-progress' : 'locked';
  const statusStyles = {
    locked: 'bg-[var(--color-border)]',
    'in-progress': 'bg-[var(--color-accent)]',
    completed: 'bg-[var(--color-accent-2)]',
  } as const;
  const impactTags = ['Impact: Quick win', 'Impact: Momentum', 'Impact: Leverage'];
  const impactTag = index % 2 === 0 ? impactTags[index % impactTags.length] : null;

  return (
    <div className="group rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-panel)]/40 px-4 py-4 transition hover:border-[var(--color-accent)]/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusStyles[status]}`} aria-hidden="true" />
          <span className="sr-only">Status: {status.replace('-', ' ')}</span>
          <div className="min-w-0 flex-1">
            {editMode ? (
              <input
                id={`${id}-label`}
                value={label}
                onChange={(event) => onLabelChange(event.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                aria-label="Edit question label"
              />
            ) : (
              <label
                htmlFor={id}
                className="block truncate text-[15px] font-medium text-[var(--color-text)]"
                title={label}
              >
                {label}
              </label>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text)] transition-transform duration-200 group-focus-within:scale-105 group-hover:scale-105">
            Lv {value}
          </span>
          {impactTag ? (
            <span className="rounded-full border border-[var(--color-border)]/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {impactTag}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative mt-3">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-[var(--range-edge)]">
          <div className="flex items-center justify-between">
            {Array.from({ length: 6 }).map((_, tickIndex) => (
              <span
                key={`${id}-tick-${tickIndex}`}
                className={`h-2 w-px rounded-full bg-[var(--color-border)]/80 ${
                  tickIndex === 0 ? 'opacity-0' : 'opacity-100'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <AppSlider
          id={id}
          value={value}
          min={0}
          max={5}
          step={1}
          onChange={(nextValue) => onChange(nextValue as number)}
          ariaLabel={label}
          className="relative z-10 w-full signal-slider"
        />
      </div>
    </div>
  );
};

export default SliderRow;
