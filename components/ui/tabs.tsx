import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("border-line relative flex gap-1 border-b", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTab = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tab>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Tab
    ref={ref}
    className={cn(
      "text-ink-muted hover:text-ink relative rounded-t-md px-4 py-2.5 text-[15px] font-medium transition-colors duration-[120ms] outline-none",
      "data-[selected]:text-ink",
      "focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsTab.displayName = "TabsTab";

export const TabsIndicator = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Indicator
    ref={ref}
    className={cn(
      "bg-accent absolute bottom-0 left-0 h-[2px] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] transition-all duration-[180ms]",
      className
    )}
    {...props}
  />
));
TabsIndicator.displayName = "TabsIndicator";

export const TabsPanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Panel>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Panel
    ref={ref}
    className={cn("pt-6 outline-none", className)}
    {...props}
  />
));
TabsPanel.displayName = "TabsPanel";
