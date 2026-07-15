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

type HandlePosition = "nw" | "ne" | "sw" | "se";

const MIN_SIZE_PX = 24;

function clampRect(rect: Rect, boundsWidth: number, boundsHeight: number): Rect {
  const width = Math.min(Math.max(rect.width, MIN_SIZE_PX), boundsWidth);
  const height = Math.min(Math.max(rect.height, MIN_SIZE_PX), boundsHeight);
  const x = Math.min(Math.max(rect.x, 0), boundsWidth - width);
  const y = Math.min(Math.max(rect.y, 0), boundsHeight - height);
  return { x, y, width, height };
}

/**
 * Eigener, abhängigkeitsfreier Zuschneide-Dialog: Rahmen über dem Bild
 * ziehen (bewegen per Griff in der Mitte, Größe per Eckgriffe ändern),
 * "Übernehmen" schneidet den gewählten Bereich per <canvas> in
 * Originalauflösung aus.
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
  const containerRef = React.useRef<HTMLDivElement>(null);
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
    if (!drag || !rect) return;
    const { width: boundsWidth, height: boundsHeight } = boundsSize();
    const dx = event.clientX - drag.startPointerX;
    const dy = event.clientY - drag.startPointerY;

    if (drag.mode === "move") {
      setRect(
        clampRect(
          { ...drag.startRect, x: drag.startRect.x + dx, y: drag.startRect.y + dy },
          boundsWidth,
          boundsHeight
        )
      );
      return;
    }

    const start = drag.startRect;
    let next: Rect = { ...start };
    if (drag.mode === "se") {
      next = { ...start, width: start.width + dx, height: start.height + dy };
    } else if (drag.mode === "sw") {
      next = {
        x: start.x + dx,
        y: start.y,
        width: start.width - dx,
        height: start.height + dy,
      };
    } else if (drag.mode === "ne") {
      next = {
        x: start.x,
        y: start.y + dy,
        width: start.width + dx,
        height: start.height - dy,
      };
    } else if (drag.mode === "nw") {
      next = {
        x: start.x + dx,
        y: start.y + dy,
        width: start.width - dx,
        height: start.height - dy,
      };
    }
    setRect(clampRect(next, boundsWidth, boundsHeight));
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

  const handles: { position: HandlePosition; className: string }[] = [
    { position: "nw", className: "-top-1.5 -left-1.5 cursor-nwse-resize" },
    { position: "ne", className: "-top-1.5 -right-1.5 cursor-nesw-resize" },
    { position: "sw", className: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
    { position: "se", className: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
  ];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Bild zuschneiden" className="max-w-2xl">
        <div className="flex flex-col gap-4">
          <p className="text-ink-muted text-[13px]">
            Rahmen ziehen, um den Ausschnitt zu ändern. Ecken zum Skalieren,
            Mitte zum Verschieben.
          </p>
          <div
            ref={containerRef}
            className="bg-surface-alt relative flex max-h-[60vh] items-center justify-center overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt=""
              onLoad={initRect}
              className="max-h-[60vh] max-w-full"
              style={{ display: "block" }}
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
                  {handles.map((handle) => (
                    <div
                      key={handle.position}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        startDrag(handle.position)(event);
                      }}
                      className={cn(
                        "bg-accent absolute size-3 touch-none rounded-full border-2 border-white",
                        handle.className
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : null}
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
