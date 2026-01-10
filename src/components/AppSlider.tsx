import React from 'react';

import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type SliderValue = number | [number, number];

type AppSliderProps = {
  id?: string;
  value?: SliderValue;
  defaultValue?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: SliderValue) => void;
  onCommit?: (value: SliderValue) => void;
  ariaLabel?: string;
  className?: string;
};

const toArrayValue = (value?: SliderValue) => {
  if (typeof value === 'number') return [value];
  if (Array.isArray(value)) return value;
  return undefined;
};

const toOutputValue = (values: number[], isRange: boolean): SliderValue => {
  if (isRange) {
    return [values[0] ?? 0, values[1] ?? 0];
  }
  return values[0] ?? 0;
};

const AppSlider: React.FC<AppSliderProps> = ({
  id,
  value,
  defaultValue,
  min,
  max,
  step,
  disabled,
  onChange,
  onCommit,
  ariaLabel,
  className,
}) => {
  const isRange = Array.isArray(value ?? defaultValue);

  return (
    <Slider
      id={id}
      value={toArrayValue(value)}
      defaultValue={toArrayValue(defaultValue)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(values) => {
        if (!onChange) return;
        onChange(toOutputValue(values, isRange));
      }}
      onValueCommit={(values) => {
        if (!onCommit) return;
        onCommit(toOutputValue(values, isRange));
      }}
      aria-label={ariaLabel}
      className={cn('h-[var(--range-hit-area)] px-[var(--range-edge)]', className)}
    />
  );
};

export default AppSlider;
