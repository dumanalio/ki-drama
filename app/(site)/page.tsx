import Image from "next/image";
import Link from "next/link";
import { Newspaper, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/site/section";
import { LandingFaqView } from "@/components/site/landing-faq-view";
import { LandingSectionView } from "@/components/site/landing-section-view";
import { PostCard } from "@/components/site/post-card";
import { resolveButtonStyle } from "@/lib/button-color";
import {
  EMPTY_LANDING_CONTENT,
  pick,
  type LandingSection,
} from "@/lib/landing-content";
import { isVideoPath, videoPlaybackAttrs } from "@/lib/media-constants";
import { getPublishedPosts } from "@/lib/queries/content";
import { getLandingPageContent } from "@/lib/queries/admin-settings";
import type { Post } from "@/types/database";

// Rein öffentliche Inhalte (Beiträge, Startseiten-Texte) — Admin-Aktionen
// rufen bei Änderungen bereits revalidatePath() auf, dieser Wert ist nur
// das zeitbasierte Sicherheitsnetz.
export const revalidate = 3600;

// Solange niemand eigene Abschnitte angelegt hat: dieselben zwei
// Split-Sektionen, die es vorher fest gab.
const DEFAULT_SECTIONS: LandingSection[] = [
  {
    id: "default-grundlagen",
    layout: "image-left",
    columnCount: 1,
    columns: [],
    eyebrow: "Grundlagen",
    title: "Die Basics, ohne Fachchinesisch",
    text: "Was ist ein Sprachmodell? Was bedeutet Token, Prompt oder Halluzination? Kurze Kapitel erklären die Begriffe, die du wirklich brauchst – der Reihe nach, im eigenen Tempo.",
    checklistItems: [
      "Kurze Kapitel statt langer Texte",
      "Verständlich auch ohne Vorwissen",
    ],
    imageUrl: null,
    imageAlt: null,
    imageVideoPlaybackMode: "controls",
    button: {
      label: "Grundlagen ansehen",
      href: "/grundlagen",
      color: "soft",
      customColor: null,
      textColor: "auto",
      textCustomColor: null,
    },
  },
  {
    id: "default-landschaft",
    layout: "image-right",
    columnCount: 1,
    columns: [],
    eyebrow: "Landschaft",
    title: "Ein neutraler Blick auf die aktuellen Tools",
    text: "Welche Werkzeuge gibt es, wofür taugen sie, und worauf solltest du achten? Ohne Empfehlungen, ohne Bewertungen – nur eine klare Übersicht.",
    checklistItems: [
      "Neutral beschrieben, keine Empfehlungen",
      "Nach Kategorie filterbar",
    ],
    imageUrl: null,
    imageAlt: null,
    imageVideoPlaybackMode: "controls",
    button: {
      label: "Landschaft ansehen",
      href: "/landschaft",
      color: "soft",
      customColor: null,
      textColor: "auto",
      textCustomColor: null,
    },
  },
];

export default async function Home() {
  let posts: Post[] = [];
  let loadError = false;

  try {
    posts = await getPublishedPosts(3);
  } catch {
    loadError = true;
  }

  // Ein Fehlschlag hier soll die Seite nicht blockieren — dieselbe
  // Rückfall-Logik greift ohnehin, wenn einfach nichts konfiguriert ist.
  const content = await getLandingPageContent().catch(
    () => EMPTY_LANDING_CONTENT
  );

  const hero = content.hero;
  const sections =
    content.sections.length > 0 ? content.sections : DEFAULT_SECTIONS;
  const faq = content.faq;
  const cta = content.closingCta;
  const heroPrimaryButton = resolveButtonStyle(
    hero.primaryButtonColor,
    hero.primaryButtonCustomColor,
    hero.primaryButtonTextColor,
    hero.primaryButtonTextCustomColor
  );
  const heroSecondaryButton = resolveButtonStyle(
    hero.secondaryButtonColor,
    hero.secondaryButtonCustomColor,
    hero.secondaryButtonTextColor,
    hero.secondaryButtonTextCustomColor
  );
  const ctaButton = resolveButtonStyle(
    cta.buttonColor,
    cta.buttonCustomColor,
    cta.buttonTextColor,
    cta.buttonTextCustomColor
  );

  return (
    <>
      <Section className="pb-0">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-16">
          <div className="flex flex-1 flex-col gap-6">
            {hero.eyebrow ? (
              <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
                {hero.eyebrow}
              </span>
            ) : null}
            <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] whitespace-pre-line md:text-[52px]">
              {pick(hero.title, "Erklärung statt Aufregung.")}
            </h1>
            <p className="text-ink-soft max-w-[55ch] text-[17px] leading-relaxed">
              {pick(
                hero.subtitle,
                "Verstehe, wie KI funktioniert, sieh dir die aktuelle Tool-Landschaft an und finde in einem kurzen Gespräch heraus, wo du anfangen kannst."
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={heroPrimaryButton.variant}
                style={heroPrimaryButton.style}
                size="lg"
                render={<Link href="/check" />}
              >
                {pick(hero.primaryButtonLabel, "Check starten")}
              </Button>
              <Button
                variant={heroSecondaryButton.variant}
                style={heroSecondaryButton.style}
                size="lg"
                arrow
                render={<Link href="/grundlagen" />}
              >
                {pick(hero.secondaryButtonLabel, "Erst mal verstehen")}
              </Button>
            </div>
          </div>
          <div className="w-full flex-1">
            {hero.imageUrl && isVideoPath(hero.imageUrl) ? (
              <div className="bg-surface-alt relative aspect-4/3 w-full overflow-hidden rounded-[20px]">
                <video
                  src={hero.imageUrl}
                  {...videoPlaybackAttrs(hero.imageVideoPlaybackMode)}
                  className="size-full object-cover"
                />
              </div>
            ) : hero.imageUrl ? (
              <div className="bg-surface-alt relative aspect-4/3 w-full overflow-hidden rounded-[20px]">
                <Image
                  src={hero.imageUrl}
                  alt={hero.imageAlt ?? ""}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="bg-accent-soft flex aspect-4/3 w-full items-center justify-center rounded-[20px]">
                <Sparkles
                  className="text-accent size-16"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>
      </Section>

      {sections.map((section) => (
        <Section key={section.id}>
          <LandingSectionView section={section} />
        </Section>
      ))}

      <Section>
        <h2 className="text-ink mb-8 text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
          Neueste Beiträge
        </h2>
        {loadError ? (
          <ErrorState
            title="Beiträge konnten nicht geladen werden"
            description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
          />
        ) : posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Newspaper}
            title="Noch keine Beiträge veröffentlicht"
            description="Hier erscheinen in Kürze die neuesten Artikel rund um KI-Grundlagen und Werkzeuge."
          />
        )}
      </Section>

      {faq.items.some((item) => item.question?.trim()) ? (
        <Section>
          <LandingFaqView faq={faq} />
        </Section>
      ) : null}

      <Section>
        <div className="bg-ink flex flex-col items-start gap-6 rounded-[20px] px-8 py-12 text-white md:flex-row md:items-center md:justify-between md:px-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
              {pick(cta.title, "Bereit für ein kurzes Gespräch?")}
            </h2>
            <p className="max-w-[50ch] text-[17px] leading-relaxed text-white/80">
              {pick(
                cta.text,
                "Beantworte ein paar Fragen, wir schauen uns dein Thema an, du buchst direkt einen Termin. Dauert keine zehn Minuten."
              )}
            </p>
          </div>
          <Button
            variant={ctaButton.variant}
            style={ctaButton.style}
            size="lg"
            render={<Link href="/check" />}
          >
            {pick(cta.buttonLabel, "Check starten")}
          </Button>
        </div>
      </Section>
    </>
  );
}
