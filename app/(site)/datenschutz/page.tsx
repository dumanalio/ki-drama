import { Callout } from "@/components/ui/callout";
import { Section } from "@/components/site/section";

export default function DatenschutzPage() {
  return (
    <Section>
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Datenschutzerklärung
        </h1>

        <Callout>
          Dieser Bereich ist ein Gerüst. Ergänze die eckigen Klammern mit den
          echten Angaben, bevor die Seite veröffentlicht wird. Ein Blick von
          jemandem, der sich mit Datenschutzrecht auskennt, lohnt sich bei einem
          Buchungssystem mit personenbezogenen Daten.
        </Callout>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            1. Verantwortlicher
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            [Name / Firma]
            <br />
            [Anschrift]
            <br />
            E-Mail: [E-Mail-Adresse]
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            2. Übersicht der Verarbeitungen
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            Diese Website nutzt folgende Dienste zur Bereitstellung und zum
            Betrieb:
          </p>
          <ul className="text-ink-soft list-disc space-y-1 pl-6 text-[17px] leading-relaxed">
            <li>Hosting: Vercel</li>
            <li>
              Datenbank und Authentifizierung: Supabase (Region Frankfurt, EU)
            </li>
            <li>E-Mail-Versand: Resend</li>
            <li>Spam-Schutz beim Check: Cloudflare Turnstile</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            3. Daten beim Ausfüllen des Checks
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            Beim Ausfüllen des Checks erheben wir die von dir angegebenen
            Antworten sowie Name, E-Mail-Adresse und optional Firmenname. Die
            Verarbeitung erfolgt auf Grundlage deiner Einwilligung (Art. 6 Abs.
            1 lit. a DSGVO), die du beim Absenden gibst. Bei einer Terminbuchung
            verarbeiten wir zusätzlich den gewählten Termin.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            4. Cookies und Analyse
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            Für die Analyse der Websitenutzung setzen wir ein cookienloses
            Analyse-Tool ein. Es werden keine personenbezogenen Cookies gesetzt,
            daher ist kein Cookie-Banner erforderlich. [Analyse-Tool benennen,
            sobald eingerichtet]
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            5. Speicherdauer
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            [Angabe ergänzen, z. B. Löschfristen für Leads ohne Terminbuchung]
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            6. Deine Rechte
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und
            Einschränkung der Verarbeitung deiner personenbezogenen Daten sowie
            ein Recht auf Datenübertragbarkeit und Widerspruch. Wende dich dazu
            an die oben genannte E-Mail-Adresse. Außerdem steht dir ein
            Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu.
          </p>
        </div>
      </div>
    </Section>
  );
}
