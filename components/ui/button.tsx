import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors duration-[120ms] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-ink/90",
        accent: "bg-accent text-white hover:bg-accent-hover",
        soft: "bg-accent-soft text-accent hover:text-accent-hover",
        outline:
          "border border-line bg-surface text-ink hover:border-line-strong",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof ButtonPrimitive>, "children">,
    VariantProps<typeof buttonVariants> {
  arrow?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      arrow,
      loading,
      disabled,
      children,
      render,
      nativeButton,
      ...props
    },
    ref
  ) => {
    return (
      <ButtonPrimitive
        ref={ref}
        disabled={disabled || loading}
        render={render}
        nativeButton={nativeButton ?? !render}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {children}
        {arrow && !loading ? (
          <ArrowRight className="size-4" aria-hidden="true" />
        ) : null}
      </ButtonPrimitive>
    );
  }
);
Button.displayName = "Button";
