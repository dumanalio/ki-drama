import { Callout } from "@/components/ui/callout";
import { Section } from "@/components/site/section";

export default function ImpressumPage() {
  return (
    <Section>
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Impressum
        </h1>

        <Callout>
          Dieser Bereich ist ein Gerüst. Ergänze die eckigen Klammern mit den
          echten Angaben, bevor die Seite veröffentlicht wird.
        </Callout>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            Angaben gemäß § 5 TMG
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            [Name / Firma]
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ und Ort]
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            Kontakt
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            Telefon: [Telefonnummer]
            <br />
            E-Mail: [E-Mail-Adresse]
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            Umsatzsteuer-ID
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            [USt-IdNr., falls vorhanden]
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            [Name, Anschrift wie oben]
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            Streitschlichtung
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover underline underline-offset-2"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Wir sind nicht verpflichtet und nicht bereit, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen, sofern hier nichts anderes angegeben ist.
          </p>
        </div>
      </div>
    </Section>
  );
}
