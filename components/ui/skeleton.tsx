import * as React from "react";

import { cn } from "@/lib/utils";

export const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn("bg-surface-alt animate-pulse rounded-lg", className)}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";
