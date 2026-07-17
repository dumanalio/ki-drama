import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckList } from "@/components/ui/check-list";
import { resolveButtonStyle } from "@/lib/button-color";
import { cn } from "@/lib/utils";
import { isVideoPath, videoPlaybackAttrs } from "@/lib/media-constants";
import type { LandingSection } from "@/lib/landing-content";

function SectionButton({
  button,
}: {
  button: LandingSection["button"];
}) {
  if (!button || !button.label || !button.href) return null;

  const resolved = resolveButtonStyle(
    button.color,
    button.customColor,
    button.textColor,
    button.textCustomColor
  );

  return (
    <Button
      variant={resolved.variant}
      style={resolved.style}
      className="w-fit"
      render={<Link href={button.href} />}
    >
      {button.label}
    </Button>
  );
}

function SectionMedia({
  imageUrl,
  imageAlt,
  videoPlaybackMode = "controls",
}: {
  imageUrl: string | null;
  imageAlt: string | null;
  videoPlaybackMode?: LandingSection["imageVideoPlaybackMode"];
}) {
  if (imageUrl && isVideoPath(imageUrl)) {
    return (
      <video
        src={imageUrl}
        {...videoPlaybackAttrs(videoPlaybackMode)}
        className="size-full object-cover"
      />
    );
  }

  return (
    <div className="relative size-full">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt ?? ""}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="text-ink-muted flex h-full items-center justify-center text-[14px]">
          Kein Bild gewählt
        </div>
      )}
    </div>
  );
}

function SectionColumnView({
  column,
}: {
  column: LandingSection["columns"][number];
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="bg-accent-soft aspect-4/3 w-full overflow-hidden rounded-[20px]">
        <SectionMedia
          imageUrl={column.imageUrl}
          imageAlt={column.imageAlt}
          videoPlaybackMode={column.imageVideoPlaybackMode}
        />
      </div>
      {column.title ? (
        <h3 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
          {column.title}
        </h3>
      ) : null}
      {column.text ? (
        <p className="text-ink-soft text-[15px] leading-relaxed">
          {column.text}
        </p>
      ) : null}
      <SectionButton button={column.button} />
    </div>
  );
}

export function LandingSectionView({ section }: { section: LandingSection }) {
  const checklistItems = section.checklistItems.filter(
    (item): item is string => Boolean(item && item.trim().length > 0)
  );
  const button = <SectionButton button={section.button} />;

  if (section.columnCount > 1) {
    const hasHeading = Boolean(section.eyebrow || section.title || section.text);
    return (
      <div className="flex flex-col gap-10">
        {hasHeading ? (
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
            {section.eyebrow ? (
              <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
                {section.eyebrow}
              </span>
            ) : null}
            {section.title ? (
              <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
                {section.title}
              </h2>
            ) : null}
            {section.text ? (
              <p className="text-ink-soft text-[17px] leading-relaxed">
                {section.text}
              </p>
            ) : null}
          </div>
        ) : null}
        <div
          className={cn(
            "grid gap-8",
            section.columnCount === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
          )}
        >
          {section.columns.map((column) => (
            <SectionColumnView key={column.id} column={column} />
          ))}
        </div>
      </div>
    );
  }

  if (section.layout === "no-image") {
    return (
      <Card className="mx-auto flex max-w-[640px] flex-col items-start gap-4">
        {section.eyebrow ? (
          <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
            {section.eyebrow}
          </span>
        ) : null}
        {section.title ? (
          <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
            {section.title}
          </h2>
        ) : null}
        {section.text ? (
          <p className="text-ink-soft max-w-[65ch] text-[16px] leading-relaxed md:text-[17px]">
            {section.text}
          </p>
        ) : null}
        {checklistItems.length > 0 ? (
          <CheckList items={checklistItems} />
        ) : null}
        {button}
      </Card>
    );
  }

  if (section.layout === "image-top") {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-accent-soft aspect-16/9 w-full overflow-hidden rounded-[20px]">
          <SectionMedia
            imageUrl={section.imageUrl}
            imageAlt={section.imageAlt}
            videoPlaybackMode={section.imageVideoPlaybackMode}
          />
        </div>
        <div className="flex flex-col items-start gap-4">
          {section.eyebrow ? (
            <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
              {section.eyebrow}
            </span>
          ) : null}
          {section.title ? (
            <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
              {section.title}
            </h2>
          ) : null}
          {section.text ? (
            <p className="text-ink-soft max-w-[65ch] text-[16px] leading-relaxed md:text-[17px]">
              {section.text}
            </p>
          ) : null}
          {checklistItems.length > 0 ? (
            <CheckList items={checklistItems} />
          ) : null}
          {button}
        </div>
      </div>
    );
  }

  if (section.layout === "image-overlay") {
    const hasImage = Boolean(section.imageUrl);
    return (
      <div
        className={cn(
          "relative aspect-4/3 min-h-[360px] w-full overflow-hidden rounded-[20px] md:aspect-16/9",
          hasImage ? "bg-accent-soft" : "bg-ink"
        )}
      >
        {hasImage ? (
          <>
            <SectionMedia
              imageUrl={section.imageUrl}
              imageAlt={section.imageAlt}
              videoPlaybackMode={section.imageVideoPlaybackMode}
            />
            {/* Scrim von unten -- macht weißen Text über jedem Bild lesbar. */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent"
              aria-hidden="true"
            />
          </>
        ) : null}
        <div className="relative flex h-full flex-col items-start justify-end gap-4 p-8">
          {section.eyebrow ? (
            <span className="text-[13px] font-semibold tracking-[0.06em] text-white/80 uppercase">
              {section.eyebrow}
            </span>
          ) : null}
          {section.title ? (
            <h2 className="text-[26px] font-bold tracking-[-0.015em] text-white md:text-[34px]">
              {section.title}
            </h2>
          ) : null}
          {section.text ? (
            <p className="max-w-[65ch] text-[16px] leading-relaxed text-white/90 md:text-[17px]">
              {section.text}
            </p>
          ) : null}
          {checklistItems.length > 0 ? (
            <CheckList items={checklistItems} tone="inverted" />
          ) : null}
          {button}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-10 md:flex-row md:items-center md:gap-16",
        // Text steht im DOM vor dem Bild (für "Bild zuerst" auf Mobil per
        // order-Klassen unten). Ohne Umkehrung stünde das Bild auf Desktop
        // also rechts -- das ist "image-left", darum hier umkehren.
        section.layout === "image-left" && "md:flex-row-reverse"
      )}
    >
      <div className="order-2 flex flex-1 flex-col items-start gap-5 md:order-none">
        {section.eyebrow ? (
          <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
            {section.eyebrow}
          </span>
        ) : null}
        {section.title ? (
          <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
            {section.title}
          </h2>
        ) : null}
        {section.text ? (
          <p className="text-ink-soft max-w-[65ch] text-[16px] leading-relaxed md:text-[17px]">
            {section.text}
          </p>
        ) : null}
        {checklistItems.length > 0 ? (
          <CheckList items={checklistItems} />
        ) : null}
        {button}
      </div>
      <div className="order-1 flex-1 md:order-none">
        <div className="bg-accent-soft aspect-4/3 w-full overflow-hidden rounded-[20px]">
          <SectionMedia
            imageUrl={section.imageUrl}
            imageAlt={section.imageAlt}
            videoPlaybackMode={section.imageVideoPlaybackMode}
          />
        </div>
      </div>
    </div>
  );
}
