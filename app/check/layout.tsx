import type { ReactNode } from "react";

/**
 * Bewusst ohne Header/Footer: Der Check soll sich leicht anfühlen, ohne
 * Navigations-Ablenkung. Gilt für den ganzen Funnel-Flow (/check,
 * /check/termin, /check/danke).
 */
export default function CheckLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
