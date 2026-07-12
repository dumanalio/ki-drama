import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "border-line text-ink placeholder:text-ink-muted bg-surface min-h-[120px] w-full resize-y rounded-lg border px-3 py-2.5 text-[15px] leading-relaxed transition-colors duration-[120ms] outline-none",
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
Textarea.displayName = "Textarea";
