import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    const control = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          "border-line bg-surface flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-[120ms] outline-none",
          "hover:border-line-strong",
          "data-[checked]:border-accent data-[checked]:bg-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex text-white">
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label) return control;

    return (
      <label
        htmlFor={checkboxId}
        className="text-ink-soft flex cursor-pointer items-start gap-2.5 text-[15px] leading-relaxed"
      >
        {control}
        <span>{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
