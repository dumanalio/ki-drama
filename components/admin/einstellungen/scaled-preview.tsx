"use client";

import * as React from "react";

/**
 * Rendert children bei fester "logischer" Breite (Standard: 1200px, wie der
 * echte Seiten-Container) und skaliert das Ergebnis proportional auf die
 * verfügbare Breite herunter. So greifen md:-Breakpoints innerhalb der
 * children genauso wie auf der echten Seite -- ein normaler schmaler
 * Container würde sie fälschlich nie auslösen, weil Tailwinds Breakpoints
 * am Viewport hängen, nicht am Elternelement.
 */
export function ScaledPreview({
  children,
  width = 1200,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    function update() {
      if (!container || !content) return;
      const nextScale = container.offsetWidth / width;
      setScale(nextScale);
      setHeight(content.offsetHeight * nextScale);
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={containerRef} className="overflow-hidden" style={{ height }}>
      <div
        ref={contentRef}
        style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
