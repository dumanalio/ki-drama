export type CalloutVariant = "info" | "warning" | "success";

export function calloutClasses(variant: CalloutVariant): {
  box: string;
  icon: string;
} {
  if (variant === "warning") {
    return { box: "bg-warning-soft", icon: "text-warning" };
  }
  if (variant === "success") {
    return { box: "bg-success-soft", icon: "text-success" };
  }
  return { box: "bg-accent-soft", icon: "text-accent" };
}
