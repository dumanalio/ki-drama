import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CheckListProps extends React.ComponentPropsWithoutRef<"ul"> {
  items: React.ReactNode[];
}

export const CheckList = React.forwardRef<HTMLUListElement, CheckListProps>(
  ({ className, items, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="bg-accent mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full">
            <Check
              className="size-3"
              strokeWidth={3}
              color="white"
              aria-hidden="true"
            />
          </span>
          <span className="text-ink-soft text-[15px] leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
);
CheckList.displayName = "CheckList";
