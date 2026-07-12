import type { ReactNode } from "react";

/**
 * Bewusst ohne Header/Footer, wie der /check-Flow: Dieser Bereich wird über
 * einen persönlichen Link aus einer E-Mail erreicht, nicht über die Navigation.
 */
export default function TerminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
