import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export interface ModalContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Dialog.Popup>,
  "title"
> {
  title: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, title, footer, children, ...props }, ref) => (
    <Dialog.Portal>
      <Dialog.Backdrop
        className={cn(
          "bg-ink/40 fixed inset-0 z-50 transition-opacity duration-150",
          "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        )}
      />
      <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Popup
          ref={ref}
          className={cn(
            "shadow-float bg-surface w-full max-w-md rounded-2xl p-6 transition-all duration-150",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <Dialog.Title className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Schließen"
              className="text-ink-muted hover:text-ink shrink-0 rounded-md p-1 transition-colors duration-[120ms]"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="text-ink-soft text-[15px] leading-relaxed">
            {children}
          </div>
          {footer ? (
            <div className="mt-6 flex justify-end gap-3">{footer}</div>
          ) : null}
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  )
);
ModalContent.displayName = "ModalContent";
