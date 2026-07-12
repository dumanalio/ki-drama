import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ErrorStateProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "border-line bg-surface flex flex-col items-center gap-3 rounded-xl border px-6 py-16 text-center",
        className
      )}
      {...props}
    >
      <span className="bg-danger-soft flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="text-danger size-6" aria-hidden="true" />
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
ErrorState.displayName = "ErrorState";
