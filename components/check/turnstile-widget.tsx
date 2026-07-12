"use client";

import * as React from "react";
import Script from "next/script";

interface TurnstileRenderOptions {
  sitekey: string;
  size?: "normal" | "compact" | "flexible";
  execution?: "render" | "execute";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: TurnstileRenderOptions
      ) => string;
      execute: (widgetId?: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export interface TurnstileHandle {
  execute: () => void;
  reset: () => void;
}

export interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
}

export const TurnstileWidget = React.forwardRef<
  TurnstileHandle,
  TurnstileWidgetProps
>(({ siteKey, onVerify, onError }, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  const onVerifyRef = React.useRef(onVerify);
  onVerifyRef.current = onVerify;
  const onErrorRef = React.useRef(onError);
  onErrorRef.current = onError;

  React.useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return;

    // "size" only controls the box dimensions if a challenge is actually
    // shown — it has no "invisible" value (that throws a TurnstileError).
    // The invisible experience comes from the site key's widget mode
    // ("Invisible"), configured in the Cloudflare dashboard, not here.
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      size: "normal",
      execution: "execute",
      callback: (token) => onVerifyRef.current(token),
      "error-callback": () => onErrorRef.current?.(),
    });

    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, [scriptLoaded, siteKey]);

  React.useImperativeHandle(ref, () => ({
    execute: () => {
      if (widgetId.current) window.turnstile?.execute(widgetId.current);
    },
    reset: () => {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onReady={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </>
  );
});
TurnstileWidget.displayName = "TurnstileWidget";
