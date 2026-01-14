import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[var(--range-track-height)] w-full grow overflow-hidden rounded-full bg-[var(--range-rail)]">
      <SliderPrimitive.Range className="absolute h-full bg-[var(--range-rail-active)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-[var(--range-thumb-size)] w-[var(--range-thumb-size)] rounded-full border border-[var(--color-border)] bg-[var(--color-text)] shadow-[0_6px_14px_rgba(0,0,0,0.45)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-panel)] disabled:pointer-events-none disabled:opacity-40" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
