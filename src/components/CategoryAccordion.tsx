import React from 'react';

import AppButton from './AppButton';
import carrot from '../assets/carrot.svg';

type CategoryAccordionProps = {
  id: string;
  title: string;
  description: string;
  scoreValue: number;
  scoreMax: number;
  scorePercent: number;
  open: boolean;
  onToggle: () => void;
  editMode: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  children: React.ReactNode;
};

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  id,
  title,
  description,
  scoreValue,
  scoreMax,
  scorePercent,
  open,
  onToggle,
  editMode,
  onTitleChange,
  onDescriptionChange,
  children,
}) => {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-sm">
      <AppButton
        type="button"
        variant="ghost"
        onClick={onToggle}
        className="grid h-auto min-h-[72px] w-full grid-cols-[1fr_auto] items-start gap-4 rounded-none px-5 py-4 text-left"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-header`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-3">
            {editMode ? (
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                className="min-w-[180px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm font-semibold font-display focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                aria-label="Edit category title"
              />
            ) : (
              <div
                className={`font-semibold font-display ${
                  open ? 'text-lg' : 'text-base'
                }`}
              >
                {title}
              </div>
            )}
            <div className="text-right">
              <div className="text-xs font-semibold text-[var(--color-text)]">
                {scoreValue} of {scoreMax}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {scorePercent}%
              </div>
            </div>
          </div>
          {editMode ? (
            <input
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              aria-label="Edit category description"
            />
          ) : (
            <p
              className={`mt-1 text-[var(--color-muted)] ${
                open ? 'text-xs' : 'text-[10px] leading-tight'
              }`}
            >
              {description}
            </p>
          )}
        </div>
        <img
          src={carrot}
          alt=""
          className={`mt-1 h-4 w-4 shrink-0 opacity-70 transition-transform ${
            open ? 'rotate-90' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      </AppButton>
      <div
        id={`${id}-panel`}
        className={`grid transition-all duration-300 motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!open}
        aria-labelledby={`${id}-header`}
      >
        <div className="overflow-hidden px-5 pb-5 pt-1">
          <div className="grid gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryAccordion;
