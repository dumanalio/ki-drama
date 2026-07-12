import * as React from "react";

import { cn } from "@/lib/utils";

export const Section = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"section">
>(({ className, children, ...props }, ref) => (
  <section ref={ref} className={cn("py-14 md:py-24", className)} {...props}>
    <div className="mx-auto max-w-[1200px] px-6">{children}</div>
  </section>
));
Section.displayName = "Section";
