import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  icon: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border-line bg-surface flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center",
        className
      )}
      {...props}
    >
      <span className="bg-surface-alt flex size-12 items-center justify-center rounded-full">
        <Icon className="text-ink-muted size-6" aria-hidden="true" />
      </span>
      <h3 className="text-ink text-[18px] font-semibold">{title}</h3>
      {description ? (
        <p className="text-ink-soft max-w-[45ch] text-[15px] leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
);
EmptyState.displayName = "EmptyState";
