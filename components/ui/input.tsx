import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "border-line text-ink placeholder:text-ink-muted bg-surface h-11 w-full rounded-lg border px-3 text-[15px] transition-colors duration-[120ms] outline-none",
          "hover:border-line-strong",
          "aria-invalid:border-danger",
          "disabled:bg-surface-alt disabled:text-ink-muted disabled:hover:border-line disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
