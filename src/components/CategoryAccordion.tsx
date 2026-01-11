import React from 'react';

import AppButton from './AppButton';
import carrot from '../assets/carrot.svg';

type CategoryAccordionProps = {
  id: string;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  editMode: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDragStart?: (id: string) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop?: (id: string) => void;
  titleOptions: string[];
  disabledOptions: string[];
  iconSrc: string;
  children: React.ReactNode;
};

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  id,
  title,
  description,
  open,
  onToggle,
  editMode,
  onTitleChange,
  onDescriptionChange,
  onDragStart,
  onDragOver,
  onDrop,
  titleOptions,
  disabledOptions,
  iconSrc,
  children,
}) => {
  return (
    <div
      onDragOver={onDragOver ? (event) => onDragOver(event, id) : undefined}
      onDrop={onDrop ? (event) => {
        event.preventDefault();
        onDrop(id);
      } : undefined}
    >
      <AppButton
        type="button"
        variant="ghost"
        onClick={onToggle}
        className="grid h-auto min-h-[72px] w-full grid-cols-[1fr_auto] items-start gap-4 rounded-none px-1 py-4 text-left"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-header`}
      >
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {editMode ? (
              <div
                className="mt-1 flex flex-col gap-1 cursor-grab"
                aria-hidden="true"
                draggable
                onDragStart={
                  onDragStart
                    ? (event) => {
                        event.dataTransfer.setData('text/plain', id);
                        event.dataTransfer.effectAllowed = 'move';
                        onDragStart(id);
                      }
                    : undefined
                }
                title="Drag to reorder"
              >
                <span className="h-0.5 w-4 rounded-full bg-[var(--color-border)]" />
                <span className="h-0.5 w-4 rounded-full bg-[var(--color-border)]" />
                <span className="h-0.5 w-4 rounded-full bg-[var(--color-border)]" />
              </div>
            ) : null}
            <div className="flex min-w-0 items-center gap-3">
              <img src={iconSrc} alt="" className="h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                {editMode ? (
                  <select
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    className="min-w-[200px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm font-semibold font-display focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                    aria-label="Edit category title"
                  >
                    {titleOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={disabledOptions.includes(option) && option !== title}
                        className={disabledOptions.includes(option) && option !== title ? 'text-[var(--color-muted)]' : undefined}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="font-semibold font-display text-base">
                    {title}
                  </div>
                )}
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
              className="mt-1 text-xs text-[var(--color-muted)]"
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
