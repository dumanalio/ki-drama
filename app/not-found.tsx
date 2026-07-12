import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <span className="bg-surface-alt mb-6 flex size-14 items-center justify-center rounded-full">
        <Compass className="text-ink-muted size-7" aria-hidden="true" />
      </span>
      <h1 className="text-ink mb-3 text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
        Diese Seite gibt es nicht
      </h1>
      <p className="text-ink-soft mb-8 max-w-[45ch] text-[16px] leading-relaxed">
        Der Link ist entweder veraltet oder falsch geschrieben. Von der
        Startseite aus findest du alles wieder.
      </p>
      <Button variant="primary" render={<Link href="/" />}>
        Zur Startseite
      </Button>
    </div>
  );
}
