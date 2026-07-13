# KI-Drama — Arbeitsanweisung für Claude Code

Diese Datei liegt im Repo-Root. Claude Code liest sie bei jeder Session automatisch.
**Sie ist verbindlich. Weiche nicht ohne Rückfrage davon ab.**

---

## Was wir bauen

Eine deutschsprachige Website, die KI erklärt statt verkauft. Besucher verstehen die
Grundlagen, sehen die aktuelle Tool-Landschaft, lesen News — und buchen am Ende über
einen kurzen Fragen-Funnel ein Online-Gespräch. Dahinter ein Admin-Bereich, in dem der
Betreiber Leads sieht (CRM), Termine verwaltet und alle Inhalte pflegt.

Zielgruppe: Menschen und kleine Unternehmen, die bei KI den Anschluss verloren haben.
Ton: ruhig, klar, ohne Hype, ohne Fachjargon. Nie „revolutionär", nie „Game-Changer".

**Oberstes Prinzip: Übersichtlichkeit.** Im Zweifel weniger Elemente, mehr Weißraum,
größere Klickflächen. Wenn ein Screen kompliziert wirkt, ist er falsch.

---

## Design-System

Der Look ist an einer bestehenden Referenz-App orientiert (SaaS-Dashboard-Ästhetik:
weiße Karten, ruhiges Grau als Fläche, dunkles Navy für Hauptaktionen, Indigo als Akzent,
sehr weiche Schatten, großzügige Radien). **Halte dich exakt an diese Tokens.
Erfinde keine neuen Farben.**

### Farben (in `globals.css` als CSS-Variablen)

```css
@theme {
  /* Flächen */
  --color-canvas: #f4f4f7; /* Seitenhintergrund, Admin-Content */
  --color-surface: #ffffff; /* Karten, Panels, Sidebar */
  --color-surface-alt: #efeff2; /* Bildkacheln, Code-Blöcke, Skeletons */

  /* Text */
  --color-ink: #1e1b39; /* Überschriften, Primärtext */
  --color-ink-soft: #4a4766; /* Fließtext */
  --color-ink-muted: #6e6c85; /* Labels, Hilfstexte, Platzhalter */

  /* Linien */
  --color-line: #e3e3ea; /* Rahmen, Trenner */
  --color-line-strong: #c9c9d4; /* Rahmen bei Hover */

  /* Akzent */
  --color-accent: #5b4ee3; /* Links, sekundäre CTAs, aktive Zustände */
  --color-accent-hover: #4a3fd1;
  --color-accent-soft: #eceafd; /* Fläche für weiche Buttons, Badges, Hinweisboxen */

  /* Signal (Logo, Marker, seltene Highlights — sparsam!) */
  --color-signal: #f0523c;
  --color-signal-soft: #fdeae7;

  /* Status */
  --color-success: #1e7a47;
  --color-success-soft: #dff5e6;
  --color-warning: #9a6400;
  --color-warning-soft: #fdf1dc;
  --color-danger: #b3261e;
  --color-danger-soft: #fceae9;
}
```

Dark Mode: **nicht bauen.** Später, wenn alles steht.

### Typografie

- Display/Überschriften: **Plus Jakarta Sans** (600/700)
- Fließtext & UI: **Inter** (400/500/600)
- Beide über `next/font/google` einbinden → werden zur Buildzeit gehostet, kein Request an Google.

Skala (Desktop / Mobil):

| Rolle         | Größe      | Weight | Tracking             |
| ------------- | ---------- | ------ | -------------------- |
| Hero H1       | 52 / 34 px | 700    | -0.02em              |
| Section H2    | 34 / 26 px | 700    | -0.015em             |
| Card H3       | 20 / 18 px | 600    | -0.01em              |
| Body          | 17 / 16 px | 400    | 0, `leading-relaxed` |
| Small / Label | 14 px      | 500    | 0                    |
| Eyebrow       | 13 px      | 600    | uppercase, 0.06em    |

Zeilenlänge im Fließtext: max. `65ch`. Immer.

### Form & Raum

- Radien: Button `8px` · Input `8px` · Karte `12px` · großes Panel/Bildkachel `20px` · Badge/Pill `999px`
- Schatten (nur zwei, mehr nicht):
  - `--shadow-card: 0 1px 2px rgba(30,27,57,.05), 0 1px 3px rgba(30,27,57,.04)`
  - `--shadow-float: 0 8px 30px rgba(30,27,57,.10)` (Dropdowns, Modals, Popover)
- Abstände: nur Vielfache von 4. Sektionsabstand `96px` Desktop / `56px` Mobil.
- Container: `max-w-[1200px]`, Innenabstand `24px`.

### Buttons — exakt vier Varianten, keine fünfte

| Variante  | Aussehen                                                                | Einsatz                             |
| --------- | ----------------------------------------------------------------------- | ----------------------------------- |
| `primary` | Fläche `--color-ink`, weißer Text, `h-11 px-5 rounded-lg font-semibold` | Die **eine** Hauptaktion pro Screen |
| `accent`  | Fläche `--color-accent`, weißer Text                                    | Conversion-CTA („Check starten")    |
| `soft`    | Fläche `--color-accent-soft`, Text `--color-accent`, oft mit Pfeil `→`  | Sekundär, „Mehr erfahren →"         |
| `outline` | weiß, Rahmen `--color-line`, Text `--color-ink`                         | Abbrechen, Zurück, Nebenaktion      |

Hover: 120 ms Farbübergang. Focus: `ring-2 ring-accent ring-offset-2` — **immer sichtbar**, nie `outline: none` ohne Ersatz.

### Wiederkehrende Muster (aus der Referenz)

- **Split-Sektion:** links Text (Eyebrow, H2, Absatz, Häkchenliste, Button), rechts eine
  große Bildkachel mit `rounded-[20px]` und farbigem Hintergrund. Auf Mobil untereinander,
  Bild zuerst.
- **Häkchenliste:** kreisförmiges Check-Icon (18px) in `--color-accent`, Text daneben.
- **Hinweisbox:** Fläche `--color-accent-soft`, Radius 12px, Text links, optional
  Schließen-X rechts.
- **Admin-Sidebar:** weiß, 240px, Logo oben, darunter Navigation mit Icon + Label.
  Gruppen-Überschrift („VERWALTEN") in 11px, uppercase, `--color-ink-muted`.
  Aktiver Eintrag: `font-semibold`, Icon in `--color-accent`.
  Seiten-Header: H1 links, Primär-Button rechts oben.
- **Modal:** weiß, `rounded-2xl`, `--shadow-float`, Titel links, X rechts,
  Aktionen unten rechts (`outline` „Abbrechen" + `primary` „Übernehmen").

---

## Technische Konventionen

- **Next.js 15 App Router, TypeScript strict.** Kein `any`, kein `@ts-ignore`.
- **Server Components sind der Standard.** `"use client"` nur, wenn State/Effects/Events
  wirklich nötig sind — und dann so weit unten im Baum wie möglich.
- **Datenzugriff:**
  - Lesen (öffentlich) → Supabase mit `anon`-Key, geschützt durch RLS.
  - Schreiben → **ausschließlich** in Route Handlers (`app/api/...`) oder Server Actions
    mit `service_role`. Der Key darf niemals im Client-Bundle landen.
- **Validierung:** Ein Zod-Schema pro Formular in `lib/validation/`, genutzt von Client
  **und** Server. Serverseitige Validierung ist Pflicht, auch wenn der Client schon prüft.
- **Zeit:** In der DB immer `timestamptz` (UTC). Anzeige immer über einen einzigen Helper
  `formatBerlin()` in `lib/time.ts`. Nirgendwo sonst Zeitzonen-Logik.
- **Bilder:** immer `next/image` mit `width`/`height`. Alt-Text ist Pflichtfeld.
- **Dateien:** `kebab-case.tsx`. Komponenten `PascalCase`. Alles Deutsch, was der Nutzer
  sieht — Code, Variablen und Kommentare auf Englisch.

## Qualitätsuntergrenze — gilt für jede Komponente

1. Mobil ab 360px Breite ohne horizontales Scrollen.
2. Sichtbarer Tastatur-Fokus, Formulare per Tastatur bedienbar.
3. Jeder Datenzustand ist gebaut: **Laden** (Skeleton), **leer** (mit klarem nächsten
   Schritt), **Fehler** (was ist passiert, was tun), **Erfolg**.
4. Fehlertexte sagen, was schiefging und wie man es behebt. Keine Entschuldigungen,
   kein „Etwas ist schiefgelaufen".
5. `prefers-reduced-motion` wird respektiert.

## Vorgehen

Arbeite die Phasen aus `docs/prompts.md` **einzeln** ab. Nach jeder Phase:
`npm run build` muss durchlaufen. Erst dann die nächste.
Wenn eine Anforderung unklar ist: **frag nach, rate nicht.**

## Löschen und Aufräumen

Claude Code löscht NIEMALS eigenständig Daten aus der Datenbank oder aus
Storage — auch nicht "eigene" Testdaten. Testdaten werden beim Anlegen mit
einem eindeutigen Präfix versehen (z.B. "**TEST**") und nur exakt darüber
wieder entfernt. Nie über Namensmuster, nie über ILIKE auf Freitextfelder.
Im Zweifel: Kandidaten auflisten und mich fragen, nicht löschen.

## Testumgebung

Drei Vorfälle (gelöschtes Bild, Test-Section in echten Einstellungen,
verwaiste Test-Prozesse) haben gezeigt: interaktive Browser-Tests gegen
die echte Datenbank sind zu riskant, egal wie sorgfältig aufgeräumt wird.

**Ab sofort:** Solange keine getrennte Testumgebung eingerichtet ist,
macht Claude Code keine interaktiven/schreibenden Browser-Tests (Puppeteer
o. Ä., alles was Server Actions auslöst oder Formulare ausfüllt) gegen
die Produktiv-Datenbank. Stattdessen: TypeScript-Check, ESLint, sorgfältige
Code-Lektüre und — wo möglich — rein lesende Screenshots der bereits
laufenden Seite. Reicht das nicht für echte Gewissheit, wird das offen
gesagt, statt ungefragt doch gegen die echte DB zu testen.

**Empfohlene Lösung, sobald zugestimmt:** zweites kostenloses
Supabase-Projekt als Test-Datenbank (nicht Branching — kostet ab dem
Pro-Plan und ist für dieses Projekt Overkill; nicht lokal via CLI, weil
Docker auf dieser Maschine beim Testen einen Berechtigungsfehler geworfen
hat). Aufwand einmalig ca. 15–30 Minuten: neues Projekt anlegen,
`docs/supabase_schema.sql` einspielen, eigenen Storage-Bucket + Test-Admin
anlegen, Zugangsdaten in eine git-ignorierte `.env.test` legen, Dev-Server
für Tests auf einem eigenen Port damit starten. Laufender Aufwand:
Schema-Änderungen müssen zusätzlich in die Test-DB übertragen werden.

## Lokale Entwicklung

`npm run build` läuft NIEMALS parallel zu einem laufenden `npm run dev`
(gleiches Repo, gleicher `.next`-Ordner) — das korrumpiert den Cache
(typische Symptome: `ENOENT: ...vendor-chunks\*.js`, `__webpack_modules__[...]
is not a function`, 500er auf zufälligen Routen). Vor jedem `npm run build`
prüfen, ob ein Dev-Server auf diesem Repo läuft, und wenn ja: entweder den
Build weglassen (Dev-Server reicht meist zur Verifikation) oder den
Dev-Server sauber beenden, `.next` löschen, danach bauen. Tritt der Fehler
trotzdem auf: alle node-Prozesse dieses Repos beenden, `.next` komplett
löschen, sauber neu starten — bevor man anfängt, im Anwendungscode nach
der Ursache zu suchen.
