"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CalloutProps extends React.ComponentPropsWithoutRef<"div"> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, children, dismissible, onDismiss, ...props }, ref) => {
    const [dismissed, setDismissed] = React.useState(false);

    if (dismissed) return null;

    return (
      <div
        ref={ref}
        role="note"
        className={cn(
          "bg-accent-soft text-ink-soft flex items-start justify-between gap-4 rounded-xl p-4 text-[15px] leading-relaxed",
          className
        )}
        {...props}
      >
        <div>{children}</div>
        {dismissible ? (
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
            aria-label="Hinweis schließen"
            className="text-ink-muted hover:text-ink shrink-0 rounded-md p-1 transition-colors duration-[120ms]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  }
);
Callout.displayName = "Callout";
