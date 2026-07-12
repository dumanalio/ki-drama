"use client";

import * as React from "react";
import { Inbox, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardHeader } from "@/components/ui/card";
import { CheckList } from "@/components/ui/check-list";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import { RadioCard, RadioGroup } from "@/components/ui/radio-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Section } from "@/components/site/section";
import { SplitSection } from "@/components/site/split-section";

const COLOR_SWATCHES: { name: string; className: string }[] = [
  { name: "canvas", className: "bg-canvas" },
  { name: "surface", className: "border border-line bg-surface" },
  { name: "surface-alt", className: "bg-surface-alt" },
  { name: "ink", className: "bg-ink" },
  { name: "ink-soft", className: "bg-ink-soft" },
  { name: "ink-muted", className: "bg-ink-muted" },
  { name: "line", className: "bg-line" },
  { name: "line-strong", className: "bg-line-strong" },
  { name: "accent", className: "bg-accent" },
  { name: "accent-hover", className: "bg-accent-hover" },
  { name: "accent-soft", className: "bg-accent-soft" },
  { name: "signal", className: "bg-signal" },
  { name: "signal-soft", className: "bg-signal-soft" },
  { name: "success", className: "bg-success" },
  { name: "success-soft", className: "bg-success-soft" },
  { name: "warning", className: "bg-warning" },
  { name: "warning-soft", className: "bg-warning-soft" },
  { name: "danger", className: "bg-danger" },
  { name: "danger-soft", className: "bg-danger-soft" },
];

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-line bg-surface flex flex-col gap-3 rounded-xl border p-6">
      <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main className="flex flex-col gap-20 pb-24">
      <Section className="pb-0">
        <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
          Kontrollblick
        </span>
        <h1 className="text-ink mt-2 text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Styleguide
        </h1>
        <p className="text-ink-soft mt-3 max-w-[65ch] text-[17px] leading-relaxed">
          Alle Komponenten des Design-Systems in allen Varianten. Diese Seite
          bleibt dauerhaft bestehen und dient als Referenz gegen CLAUDE.md.
        </p>
      </Section>

      <Section className="flex flex-col gap-16 pt-0">
        <Group title="Farben">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {COLOR_SWATCHES.map((swatch) => (
              <div key={swatch.name} className="flex flex-col gap-2">
                <div
                  className={`h-16 rounded-xl ${swatch.className}`}
                  aria-hidden="true"
                />
                <span className="text-ink-muted text-[14px] font-medium">
                  {swatch.name}
                </span>
              </div>
            ))}
          </div>
        </Group>

        <Group title="Typografie">
          <div className="border-line bg-surface flex flex-col gap-6 rounded-xl border p-6">
            <p className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
              Eyebrow
            </p>
            <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
              Hero H1
            </h1>
            <h2 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
              Section H2
            </h2>
            <h3 className="text-ink text-[18px] font-semibold tracking-[-0.01em] md:text-[20px]">
              Card H3
            </h3>
            <p className="text-ink-soft max-w-[65ch] text-[16px] leading-relaxed md:text-[17px]">
              Body — Zeilenlänge im Fließtext auf maximal 65 Zeichen begrenzt,
              damit lange Absätze angenehm lesbar bleiben.
            </p>
            <p className="text-ink-soft text-[14px] font-medium">
              Small / Label
            </p>
          </div>
        </Group>

        <Group title="Button">
          <Row label="Varianten">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="soft" arrow>
                Soft mit Pfeil
              </Button>
              <Button variant="outline">Outline</Button>
            </div>
          </Row>
          <Row label="Größen">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="primary" size="md">
                Medium
              </Button>
              <Button variant="primary" size="lg">
                Large
              </Button>
            </div>
          </Row>
          <Row label="Zustände">
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" loading>
                Wird gesendet
              </Button>
              <Button variant="primary" disabled>
                Deaktiviert
              </Button>
              <Button variant="soft" arrow>
                Mehr erfahren
              </Button>
            </div>
          </Row>
        </Group>

        <Group title="Formularelemente">
          <Row label="Input">
            <Input placeholder="Name" className="max-w-sm" />
          </Row>
          <Row label="Textarea">
            <Textarea
              placeholder="Worum geht's konkret?"
              className="max-w-sm"
            />
          </Row>
          <Row label="Select">
            <Select defaultValue="privat">
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="privat">Privat</SelectItem>
                <SelectItem value="business">Unternehmen</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Checkbox">
            <Checkbox
              defaultChecked
              label="Ich habe die Datenschutzerklärung gelesen."
            />
          </Row>
          <Row label="RadioCard">
            <RadioGroup
              defaultValue="privat"
              className="grid gap-4 sm:grid-cols-2"
            >
              <RadioCard
                value="privat"
                title="Privat"
                description="Ich möchte KI für mich persönlich verstehen."
              />
              <RadioCard
                value="business"
                title="Unternehmen"
                description="Ich möchte KI in meinem Team einsetzen."
              />
            </RadioGroup>
          </Row>
        </Group>

        <Group title="Card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="Ohne Aktion" />
              <p className="text-ink-soft text-[15px] leading-relaxed">
                Eine einfache Karte mit Titel und Textinhalt.
              </p>
            </Card>
            <Card>
              <CardHeader
                title="Mit Aktion"
                action={
                  <Button variant="soft" size="sm">
                    Bearbeiten
                  </Button>
                }
              />
              <p className="text-ink-soft text-[15px] leading-relaxed">
                Header mit Titel links und Aktion rechts.
              </p>
            </Card>
          </div>
        </Group>

        <Group title="Badge">
          <Row label="Varianten">
            <div className="flex flex-wrap gap-3">
              <Badge variant="soft">Soft</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="signal">Signal</Badge>
            </div>
          </Row>
        </Group>

        <Group title="Callout">
          <div className="flex flex-col gap-4">
            <Callout>
              Ein Hinweis ohne Schließen-Möglichkeit — für dauerhaft sichtbare
              Informationen.
            </Callout>
            <Callout dismissible>
              Ein Hinweis mit Schließen-X — klicke zum Testen.
            </Callout>
          </div>
        </Group>

        <Group title="CheckList">
          <div className="border-line bg-surface rounded-xl border p-6">
            <CheckList
              items={[
                "Klare Erklärung ohne Fachjargon",
                "Neutrale Tool-Übersicht ohne Empfehlungen",
                "Ein kurzer Check statt langer Formulare",
              ]}
            />
          </div>
        </Group>

        <Group title="Modal">
          <Row label="Dialog">
            <Modal>
              <ModalTrigger className={buttonVariants({ variant: "primary" })}>
                Modal öffnen
              </ModalTrigger>
              <ModalContent
                title="Termin absagen"
                footer={
                  <>
                    <ModalClose
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Abbrechen
                    </ModalClose>
                    <ModalClose
                      className={buttonVariants({ variant: "primary" })}
                    >
                      Übernehmen
                    </ModalClose>
                  </>
                }
              >
                Möchtest du diesen Termin wirklich absagen? Der Slot wird danach
                wieder für andere buchbar.
              </ModalContent>
            </Modal>
          </Row>
        </Group>

        <Group title="Skeleton, Empty- und ErrorState">
          <Row label="Skeleton">
            <div className="flex max-w-sm flex-col gap-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </Row>
          <Row label="EmptyState">
            <EmptyState
              icon={Inbox}
              title="Noch keine Leads"
              description="Sobald jemand den Check abschließt, erscheint er hier."
              action={<Button variant="soft">Check ansehen</Button>}
            />
          </Row>
          <Row label="ErrorState">
            <ErrorState
              title="Daten konnten nicht geladen werden"
              description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
              action={
                <Button variant="outline">
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Neu laden
                </Button>
              }
            />
          </Row>
        </Group>

        <Group title="SplitSection">
          <div className="border-line bg-surface rounded-xl border p-6">
            <SplitSection
              eyebrow="Grundlagen"
              title="KI verstehen, bevor du sie einsetzt"
              checkListItems={[
                "Was ein Sprachmodell tatsächlich tut",
                "Welche Begriffe wirklich zählen",
              ]}
              action={
                <Button variant="soft" arrow>
                  Mehr erfahren
                </Button>
              }
              media={
                <div className="text-ink-muted flex h-full items-center justify-center text-[14px]">
                  Bildkachel
                </div>
              }
            >
              Ein ruhiger Einstieg ohne Fachjargon — Schritt für Schritt.
            </SplitSection>
          </div>
        </Group>

        <Group title="Header">
          <div className="border-line overflow-hidden rounded-xl border">
            <Header />
          </div>
        </Group>

        <Group title="Footer">
          <div className="border-line overflow-hidden rounded-xl border">
            <Footer />
          </div>
        </Group>
      </Section>
    </main>
  );
}
