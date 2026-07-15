"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal, ModalContent } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type HandlePosition = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

const MIN_SIZE_PX = 24;
// Sichtbarer Griff ist klein, die Klickfläche (per Padding) deutlich größer --
// besonders wichtig an Ecken/Kanten, die exakt an der Bildgrenze liegen.
const HANDLE_HIT_PX = 28;

const HANDLE_EDGES: Record<HandlePosition, { x?: "left" | "right"; y?: "top" | "bottom" }> = {
  n: { y: "top" },
  s: { y: "bottom" },
  e: { x: "right" },
  w: { x: "left" },
  nw: { x: "left", y: "top" },
  ne: { x: "right", y: "top" },
  sw: { x: "left", y: "bottom" },
  se: { x: "right", y: "bottom" },
};

// Alle Positionen als left/top-Prozentsatz + zentrierendem translate (siehe
// unten) -- bewusst NICHT mit right-0/bottom-0 gemischt, das würde das
// Zentrieren des Griffs auf den jeweiligen Punkt verfälschen.
const HANDLES: {
  position: HandlePosition;
  className: string;
  cursor: string;
}[] = [
  { position: "nw", className: "top-0 left-0", cursor: "cursor-nwse-resize" },
  { position: "n", className: "top-0 left-1/2", cursor: "cursor-ns-resize" },
  { position: "ne", className: "top-0 left-full", cursor: "cursor-nesw-resize" },
  { position: "e", className: "top-1/2 left-full", cursor: "cursor-ew-resize" },
  { position: "se", className: "top-full left-full", cursor: "cursor-nwse-resize" },
  { position: "s", className: "top-full left-1/2", cursor: "cursor-ns-resize" },
  { position: "sw", className: "top-full left-0", cursor: "cursor-nesw-resize" },
  { position: "w", className: "top-1/2 left-0", cursor: "cursor-ew-resize" },
];

/** Verschiebt den ganzen Rahmen, Größe bleibt gleich. */
function clampMove(rect: Rect, boundsWidth: number, boundsHeight: number): Rect {
  return {
    ...rect,
    x: Math.min(Math.max(rect.x, 0), Math.max(0, boundsWidth - rect.width)),
    y: Math.min(Math.max(rect.y, 0), Math.max(0, boundsHeight - rect.height)),
  };
}

/**
 * Ändert nur die Kanten, die der gezogene Griff betrifft -- die
 * gegenüberliegende Kante bleibt exakt fest. So lässt sich z. B. die rechte
 * Kante bis an den Bildrand ziehen, ohne dass die linke Kante mitwandert.
 */
function resizeRect(
  start: Rect,
  handle: HandlePosition,
  dx: number,
  dy: number,
  boundsWidth: number,
  boundsHeight: number
): Rect {
  let { x, y, width, height } = start;
  const edges = HANDLE_EDGES[handle];

  if (edges.x === "right") {
    width = Math.min(Math.max(start.width + dx, MIN_SIZE_PX), boundsWidth - start.x);
  } else if (edges.x === "left") {
    const rightEdge = start.x + start.width;
    const nextX = Math.min(Math.max(start.x + dx, 0), rightEdge - MIN_SIZE_PX);
    x = nextX;
    width = rightEdge - nextX;
  }

  if (edges.y === "bottom") {
    height = Math.min(Math.max(start.height + dy, MIN_SIZE_PX), boundsHeight - start.y);
  } else if (edges.y === "top") {
    const bottomEdge = start.y + start.height;
    const nextY = Math.min(Math.max(start.y + dy, 0), bottomEdge - MIN_SIZE_PX);
    y = nextY;
    height = bottomEdge - nextY;
  }

  return { x, y, width, height };
}

/**
 * Eigener, abhängigkeitsfreier Zuschneide-Dialog: freier Rahmen (kein
 * erzwungenes Seitenverhältnis) über dem Bild, alle 8 Griffe einzeln
 * ziehbar, reicht bis an alle vier Bildkanten. "Übernehmen" schneidet den
 * gewählten Bereich per <canvas> in Originalauflösung aus.
 */
export function ImageCropModal({
  open,
  onOpenChange,
  imageUrl,
  fileName,
  mimeType,
  onCropped,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  fileName: string;
  mimeType: string;
  onCropped: (file: File) => void;
}) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const dragState = React.useRef<{
    mode: "move" | HandlePosition;
    startPointerX: number;
    startPointerY: number;
    startRect: Rect;
  } | null>(null);

  function initRect() {
    const img = imgRef.current;
    if (!img) return;
    const width = img.clientWidth;
    const height = img.clientHeight;
    const inset = 0.1;
    setRect({
      x: width * inset,
      y: height * inset,
      width: width * (1 - inset * 2),
      height: height * (1 - inset * 2),
    });
  }

  React.useEffect(() => {
    if (!open) setRect(null);
  }, [open]);

  function boundsSize() {
    const img = imgRef.current;
    return { width: img?.clientWidth ?? 0, height: img?.clientHeight ?? 0 };
  }

  function handlePointerMove(event: React.PointerEvent) {
    const drag = dragState.current;
    if (!drag) return;
    const { width: boundsWidth, height: boundsHeight } = boundsSize();
    const dx = event.clientX - drag.startPointerX;
    const dy = event.clientY - drag.startPointerY;

    if (drag.mode === "move") {
      setRect(
        clampMove(
          { ...drag.startRect, x: drag.startRect.x + dx, y: drag.startRect.y + dy },
          boundsWidth,
          boundsHeight
        )
      );
      return;
    }

    setRect(resizeRect(drag.startRect, drag.mode, dx, dy, boundsWidth, boundsHeight));
  }

  function startDrag(mode: "move" | HandlePosition) {
    return (event: React.PointerEvent) => {
      if (!rect) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragState.current = {
        mode,
        startPointerX: event.clientX,
        startPointerY: event.clientY,
        startRect: rect,
      };
    };
  }

  function endDrag() {
    dragState.current = null;
  }

  async function handleConfirm() {
    const img = imgRef.current;
    if (!img || !rect) return;

    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const sourceX = rect.x * scaleX;
    const sourceY = rect.y * scaleY;
    const sourceWidth = rect.width * scaleX;
    const sourceHeight = rect.height * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mimeType)
    );
    if (!blob) return;

    onCropped(new File([blob], fileName, { type: mimeType }));
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Bild zuschneiden" className="max-w-2xl">
        <div className="flex flex-col gap-4">
          <p className="text-ink-muted text-[13px]">
            Rahmen frei ziehen -- alle 8 Griffe einzeln, kein festes
            Seitenverhältnis. Mitte zum Verschieben.
          </p>
          {/* p-4 sorgt dafür, dass Griffe an der Bildkante (negative Offsets)
              nicht vom overflow-hidden dieses Containers abgeschnitten werden. */}
          <div className="bg-surface-alt relative flex max-h-[60vh] items-center justify-center overflow-hidden rounded-lg p-4">
            {/*
              Dieser innere Wrapper hat KEINE eigene Breite/Höhe -- er
              schrumpft als Flex-Item auf die Größe des <img> selbst. Der
              absolut positionierte Rahmen (inset-0) sitzt darin und deckt
              sich dadurch exakt mit dem sichtbaren Bild, statt mit dem
              (oft breiteren) äußeren, zentrierenden Container. Genau dieser
              Versatz war die Ursache für ungenaues Zuschneiden.
            */}
            <div className="relative" style={{ lineHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt=""
                onLoad={initRect}
                className="block max-h-[calc(60vh-32px)] max-w-full"
                draggable={false}
              />
              {rect ? (
                <div
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  className="absolute inset-0"
                >
                  {/* Abdunkelung außerhalb des Rahmens */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-black/50"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${rect.y}px, ${rect.x}px ${rect.y}px, ${rect.x}px ${rect.y + rect.height}px, ${rect.x + rect.width}px ${rect.y + rect.height}px, ${rect.x + rect.width}px ${rect.y}px, 0 ${rect.y}px)`,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    onPointerDown={startDrag("move")}
                    className="border-accent absolute cursor-move touch-none border-2"
                    style={{
                      left: rect.x,
                      top: rect.y,
                      width: rect.width,
                      height: rect.height,
                    }}
                  >
                    {HANDLES.map((handle) => (
                      <div
                        key={handle.position}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          startDrag(handle.position)(event);
                        }}
                        className={cn(
                          "absolute flex -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center",
                          handle.className,
                          handle.cursor
                        )}
                        style={{ width: HANDLE_HIT_PX, height: HANDLE_HIT_PX }}
                      >
                        <span className="bg-accent pointer-events-none block size-3 rounded-full border-2 border-white shadow" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="size-4" aria-hidden="true" />
              Abbrechen
            </Button>
            <Button variant="primary" onClick={() => void handleConfirm()}>
              <Check className="size-4" aria-hidden="true" />
              Zuschneiden &amp; übernehmen
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
