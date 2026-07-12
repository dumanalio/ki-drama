import Link from "next/link";
import { CloudFog, HelpCircle, Newspaper, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/site/section";
import { SplitSection } from "@/components/site/split-section";
import { PostCard } from "@/components/site/post-card";
import { getPublishedPosts } from "@/lib/queries/content";
import type { Post } from "@/types/database";

export default async function Home() {
  let posts: Post[] = [];
  let loadError = false;

  try {
    posts = await getPublishedPosts(3);
  } catch {
    loadError = true;
  }

  return (
    <>
      <Section className="pb-0">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-16">
          <div className="flex flex-1 flex-col gap-6">
            <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
              Erklärung statt Aufregung.
            </h1>
            <p className="text-ink-soft max-w-[55ch] text-[17px] leading-relaxed">
              Verstehe, wie KI funktioniert, sieh dir die aktuelle
              Tool-Landschaft an und finde in einem kurzen Gespräch heraus, wo
              du anfangen kannst.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="accent"
                size="lg"
                render={<Link href="/check" />}
              >
                Check starten
              </Button>
              <Button
                variant="soft"
                size="lg"
                arrow
                render={<Link href="/grundlagen" />}
              >
                Erst mal verstehen
              </Button>
            </div>
          </div>
          <div className="w-full flex-1">
            <div className="bg-accent-soft flex aspect-4/3 w-full items-center justify-center rounded-[20px]">
              <Sparkles
                className="text-accent size-16"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
            Das Problem
          </h2>
          <p className="text-ink-soft mx-auto max-w-[55ch] text-[17px] leading-relaxed">
            Drei Dinge hören wir immer wieder, egal ob privat oder im
            Unternehmen.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Card>
            <CloudFog
              className="text-ink-muted mb-3 size-6"
              aria-hidden="true"
            />
            <h3 className="text-ink mb-2 text-[18px] font-semibold">
              Überflutung
            </h3>
            <p className="text-ink-soft text-[15px] leading-relaxed">
              Jede Woche neue Tools, neue Namen, neue Versprechen. Kaum macht
              man sich ein Bild, ist es schon wieder veraltet.
            </p>
          </Card>
          <Card>
            <HelpCircle
              className="text-ink-muted mb-3 size-6"
              aria-hidden="true"
            />
            <h3 className="text-ink mb-2 text-[18px] font-semibold">
              Unsicherheit
            </h3>
            <p className="text-ink-soft text-[15px] leading-relaxed">
              Was darf ich mit meinen Daten überhaupt machen? Wo fange ich an,
              ohne etwas falsch zu machen?
            </p>
          </Card>
          <Card>
            <Users className="text-ink-muted mb-3 size-6" aria-hidden="true" />
            <h3 className="text-ink mb-2 text-[18px] font-semibold">
              Uninformierte Teams
            </h3>
            <p className="text-ink-soft text-[15px] leading-relaxed">
              Im Unternehmen nutzt jeder KI anders – oder gar nicht. Ohne
              gemeinsames Verständnis bleibt das Potenzial ungenutzt.
            </p>
          </Card>
        </div>
      </Section>

      <Section className="flex flex-col gap-16 md:gap-24">
        <SplitSection
          eyebrow="Grundlagen"
          title="Die Basics, ohne Fachchinesisch"
          checkListItems={[
            "Kurze Kapitel statt langer Texte",
            "Verständlich auch ohne Vorwissen",
          ]}
          action={
            <Button variant="soft" arrow render={<Link href="/grundlagen" />}>
              Grundlagen ansehen
            </Button>
          }
          media={
            <div className="text-ink-muted flex h-full items-center justify-center text-[14px]">
              Grundlagen
            </div>
          }
        >
          Was ist ein Sprachmodell? Was bedeutet Token, Prompt oder
          Halluzination? Kurze Kapitel erklären die Begriffe, die du wirklich
          brauchst – der Reihe nach, im eigenen Tempo.
        </SplitSection>

        <SplitSection
          reverse
          eyebrow="Landschaft"
          title="Ein neutraler Blick auf die aktuellen Tools"
          checkListItems={[
            "Neutral beschrieben, keine Empfehlungen",
            "Nach Kategorie filterbar",
          ]}
          action={
            <Button variant="soft" arrow render={<Link href="/landschaft" />}>
              Landschaft ansehen
            </Button>
          }
          media={
            <div className="text-ink-muted flex h-full items-center justify-center text-[14px]">
              Landschaft
            </div>
          }
        >
          Welche Werkzeuge gibt es, wofür taugen sie, und worauf solltest du
          achten? Ohne Empfehlungen, ohne Bewertungen – nur eine klare
          Übersicht.
        </SplitSection>
      </Section>

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

      <Section>
        <div className="bg-ink flex flex-col items-start gap-6 rounded-[20px] px-8 py-12 text-white md:flex-row md:items-center md:justify-between md:px-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
              Bereit für ein kurzes Gespräch?
            </h2>
            <p className="max-w-[50ch] text-[17px] leading-relaxed text-white/80">
              Beantworte ein paar Fragen, wir schauen uns dein Thema an, du
              buchst direkt einen Termin. Dauert keine zehn Minuten.
            </p>
          </div>
          <Button variant="accent" size="lg" render={<Link href="/check" />}>
            Check starten
          </Button>
        </div>
      </Section>
    </>
  );
}
