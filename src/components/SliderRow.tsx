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
};

const SliderRow: React.FC<SliderRowProps> = ({
  id,
  label,
  value,
  onChange,
  editMode,
  onLabelChange,
}) => {
  return (
    <div className="question-card rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editMode ? (
            <input
              id={`${id}-label`}
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              aria-label="Edit question label"
            />
          ) : (
            <label htmlFor={id} className="text-sm font-semibold text-[var(--color-muted)]">
              {label}
            </label>
          )}
        </div>
        <div className="text-2xl font-semibold text-white">{value}</div>
      </div>

      <div className="mt-4">
        <AppSlider
          id={id}
          value={value}
          min={0}
          max={5}
          step={1}
          onChange={(nextValue) => onChange(nextValue as number)}
          ariaLabel={label}
          className="relative z-10 w-full"
        />
      </div>
    </div>
  );
};

export default SliderRow;
