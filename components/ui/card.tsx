import * as React from "react";

import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-line bg-surface shadow-card rounded-xl border p-6",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export interface CardHeaderProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  title: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-4 flex items-center justify-between gap-4", className)}
      {...props}
    >
      <h3 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
        {title}
      </h3>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
);
CardHeader.displayName = "CardHeader";
