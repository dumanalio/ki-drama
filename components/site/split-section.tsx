import * as React from "react";

import { CheckList } from "@/components/ui/check-list";
import { cn } from "@/lib/utils";

export interface SplitSectionProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  checkListItems?: React.ReactNode[];
  action?: React.ReactNode;
  media: React.ReactNode;
  reverse?: boolean;
  className?: string;
}

export function SplitSection({
  eyebrow,
  title,
  children,
  checkListItems,
  action,
  media,
  reverse,
  className,
}: SplitSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-10 md:flex-row md:items-center md:gap-16",
        reverse && "md:flex-row-reverse",
        className
      )}
    >
      <div className="order-2 flex flex-1 flex-col gap-5 md:order-none">
        {eyebrow ? (
          <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
          {title}
        </h2>
        {children ? (
          <p className="text-ink-soft max-w-[65ch] text-[16px] leading-relaxed md:text-[17px]">
            {children}
          </p>
        ) : null}
        {checkListItems ? <CheckList items={checkListItems} /> : null}
        {action}
      </div>
      <div className="order-1 flex-1 md:order-none">
        <div className="bg-accent-soft aspect-4/3 w-full overflow-hidden rounded-[20px]">
          {media}
        </div>
      </div>
    </div>
  );
}
