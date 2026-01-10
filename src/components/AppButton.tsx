import * as React from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AppButtonProps = ButtonProps & {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

// Mapping table:
// Primary/CTA -> variant="default"
// Secondary -> variant="secondary"
// Tertiary/text -> variant="ghost" | "link"
// Destructive -> variant="destructive"
// Outline -> variant="outline"
const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    className,
    ...props
  }, ref) => (
    <Button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {leftIcon && !loading ? <span aria-hidden="true">{leftIcon}</span> : null}
      <span className={cn(loading ? 'sr-only' : undefined)}>{children}</span>
      {rightIcon && !loading ? <span aria-hidden="true">{rightIcon}</span> : null}
    </Button>
  )
);

AppButton.displayName = 'AppButton';

export default AppButton;
