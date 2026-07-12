import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";

export default function UeberMichPage() {
  return (
    <Section>
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
          Über mich
        </span>
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Erklären statt verkaufen
        </h1>
        <p className="text-ink-soft text-[17px] leading-relaxed">
          Diese Seite ist entstanden, weil viele Gespräche über künstliche
          Intelligenz an derselben Stelle hängen bleiben: zu viele Tool-Namen,
          zu wenig Erklärung, und die Sorge, etwas falsch zu machen. Genau das
          will ich ändern – Schritt für Schritt, ohne Fachjargon.
        </p>
        <p className="text-ink-soft text-[17px] leading-relaxed">
          Mein Ansatz ist einfach: erst verstehen, dann entscheiden. Deshalb
          gibt es hier Grundlagen zum Nachlesen, eine neutrale Übersicht der
          aktuellen Werkzeuge – und am Ende, wenn du möchtest, ein kurzes
          persönliches Gespräch.
        </p>
        <p className="text-ink-soft text-[17px] leading-relaxed">
          Kein Hype, keine Verkaufsmasche. Nur eine ehrliche Einordnung, damit
          du selbst entscheiden kannst, was für dich sinnvoll ist.
        </p>
        <div>
          <Button variant="accent" render={<Link href="/check" />}>
            Check starten
          </Button>
        </div>
      </div>
    </Section>
  );
}
