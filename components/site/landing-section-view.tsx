import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { CheckList } from "@/components/ui/check-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LandingSection } from "@/lib/landing-content";

function SectionButton({
  button,
}: {
  button: LandingSection["button"];
}) {
  if (!button || !button.label || !button.href) return null;

  if (button.color === "custom" && button.customColor) {
    return (
      <Link
        href={button.href}
        className="inline-flex h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold whitespace-nowrap text-white transition-colors duration-[120ms]"
        style={{ backgroundColor: button.customColor }}
      >
        {button.label}
      </Link>
    );
  }

  const variant = button.color === "custom" ? "primary" : button.color;

  return (
    <Link href={button.href} className={buttonVariants({ variant })}>
      {button.label}
    </Link>
  );
}

function SectionMedia({ section }: { section: LandingSection }) {
  return (
    <div className="relative size-full">
      {section.imageUrl ? (
        <Image
          src={section.imageUrl}
          alt={section.imageAlt ?? ""}
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

export function LandingSectionView({ section }: { section: LandingSection }) {
  const checklistItems = section.checklistItems.filter(
    (item): item is string => Boolean(item && item.trim().length > 0)
  );
  const button = <SectionButton button={section.button} />;

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
          <SectionMedia section={section} />
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

  return (
    <div
      className={cn(
        "flex flex-col gap-10 md:flex-row md:items-center md:gap-16",
        section.layout === "image-right" && "md:flex-row-reverse"
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
          <SectionMedia section={section} />
        </div>
      </div>
    </div>
  );
}
