import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "@/lib/utils";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogClose = AlertDialogPrimitive.Close;

export interface AlertDialogContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Popup>,
  "title"
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

export const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  AlertDialogContentProps
>(({ className, title, description, footer, children, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Backdrop
      className={cn(
        "bg-ink/40 fixed inset-0 z-50 transition-opacity duration-150",
        "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
      )}
    />
    <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <AlertDialogPrimitive.Popup
        ref={ref}
        className={cn(
          "shadow-float bg-surface w-full max-w-sm rounded-2xl p-6 transition-all duration-150",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          className
        )}
        {...props}
      >
        <AlertDialogPrimitive.Title className="text-ink mb-2 text-[20px] font-semibold tracking-[-0.01em]">
          {title}
        </AlertDialogPrimitive.Title>
        {description ? (
          <AlertDialogPrimitive.Description className="text-ink-soft text-[15px] leading-relaxed">
            {description}
          </AlertDialogPrimitive.Description>
        ) : null}
        {children}
        {footer ? (
          <div className="mt-6 flex justify-end gap-3">{footer}</div>
        ) : null}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Viewport>
  </AlertDialogPrimitive.Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";
