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
  disabled?: boolean;
};

const SliderRow: React.FC<SliderRowProps> = ({
  id,
  label,
  value,
  onChange,
  editMode,
  onLabelChange,
  disabled,
}) => {
  return (
    <div className={`group px-4 py-5 ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0 flex-1">
            {editMode ? (
              <input
                id={`${id}-label`}
                value={label}
                onChange={(event) => onLabelChange(event.target.value)}
                className="w-full min-w-[360px] md:min-w-[520px] rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                aria-label="Edit question label"
              />
            ) : (
              <label
                htmlFor={id}
                className="block truncate text-[15px] font-medium text-[#c7c7c7]"
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
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default SliderRow;
