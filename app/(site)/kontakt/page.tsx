import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";

export default function KontaktPage() {
  return (
    <Section>
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
          Kontakt
        </span>
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Reden wir.
        </h1>
        <p className="text-ink-soft text-[17px] leading-relaxed">
          Der schnellste Weg zu einem Gespräch ist der Check: ein paar kurze
          Fragen, danach kannst du direkt einen Termin buchen.
        </p>
        <div>
          <Button variant="accent" size="lg" render={<Link href="/check" />}>
            Check starten
          </Button>
        </div>
        <p className="text-ink-soft text-[15px] leading-relaxed">
          Lieber erst stöbern?{" "}
          <Link
            href="/grundlagen"
            className="text-accent hover:text-accent-hover underline underline-offset-2"
          >
            Schau dir die Grundlagen an
          </Link>{" "}
          oder{" "}
          <Link
            href="/landschaft"
            className="text-accent hover:text-accent-hover underline underline-offset-2"
          >
            wirf einen Blick auf die Tool-Landschaft
          </Link>
          .
        </p>
      </div>
    </Section>
  );
}
