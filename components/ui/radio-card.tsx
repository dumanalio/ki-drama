import * as React from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

export const RadioGroup = RadioGroupPrimitive;

export interface RadioCardProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Radio.Root>,
  "render" | "children" | "title"
> {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export const RadioCard = React.forwardRef<HTMLDivElement, RadioCardProps>(
  ({ className, title, description, ...props }, ref) => {
    return (
      <Radio.Root
        render={<div ref={ref} />}
        className={cn(
          "group border-line bg-surface relative flex w-full cursor-pointer flex-col gap-1 rounded-xl border p-5 text-left transition-colors duration-[120ms] outline-none",
          "hover:border-line-strong",
          "data-[checked]:border-accent data-[checked]:bg-accent-soft",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        {...props}
      >
        <span className="border-line group-data-[checked]:border-accent bg-surface absolute top-4 right-4 flex size-5 items-center justify-center rounded-full border">
          <Radio.Indicator className="bg-accent size-2.5 rounded-full" />
        </span>
        <span className="text-ink pr-8 text-[18px] font-semibold">{title}</span>
        {description ? (
          <span className="text-ink-soft text-[15px]">{description}</span>
        ) : null}
      </Radio.Root>
    );
  }
);
RadioCard.displayName = "RadioCard";
