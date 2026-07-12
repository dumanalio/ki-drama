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
  --color-canvas:      #F4F4F7;  /* Seitenhintergrund, Admin-Content */
  --color-surface:     #FFFFFF;  /* Karten, Panels, Sidebar */
  --color-surface-alt: #EFEFF2;  /* Bildkacheln, Code-Blöcke, Skeletons */

  /* Text */
  --color-ink:         #1E1B39;  /* Überschriften, Primärtext */
  --color-ink-soft:    #4A4766;  /* Fließtext */
  --color-ink-muted:   #6E6C85;  /* Labels, Hilfstexte, Platzhalter */

  /* Linien */
  --color-line:        #E3E3EA;  /* Rahmen, Trenner */
  --color-line-strong: #C9C9D4;  /* Rahmen bei Hover */

  /* Akzent */
  --color-accent:      #5B4EE3;  /* Links, sekundäre CTAs, aktive Zustände */
  --color-accent-hover:#4A3FD1;
  --color-accent-soft: #ECEAFD;  /* Fläche für weiche Buttons, Badges, Hinweisboxen */

  /* Signal (Logo, Marker, seltene Highlights — sparsam!) */
  --color-signal:      #F0523C;
  --color-signal-soft: #FDEAE7;

  /* Status */
  --color-success:     #1E7A47;  --color-success-soft: #DFF5E6;
  --color-warning:     #9A6400;  --color-warning-soft: #FDF1DC;
  --color-danger:      #B3261E;  --color-danger-soft:  #FCEAE9;
}
```

Dark Mode: **nicht bauen.** Später, wenn alles steht.

### Typografie

- Display/Überschriften: **Plus Jakarta Sans** (600/700)
- Fließtext & UI: **Inter** (400/500/600)
- Beide über `next/font/google` einbinden → werden zur Buildzeit gehostet, kein Request an Google.

Skala (Desktop / Mobil):
| Rolle | Größe | Weight | Tracking |
|---|---|---|---|
| Hero H1 | 52 / 34 px | 700 | -0.02em |
| Section H2 | 34 / 26 px | 700 | -0.015em |
| Card H3 | 20 / 18 px | 600 | -0.01em |
| Body | 17 / 16 px | 400 | 0, `leading-relaxed` |
| Small / Label | 14 px | 500 | 0 |
| Eyebrow | 13 px | 600 | uppercase, 0.06em |

Zeilenlänge im Fließtext: max. `65ch`. Immer.

### Form & Raum

- Radien: Button `8px` · Input `8px` · Karte `12px` · großes Panel/Bildkachel `20px` · Badge/Pill `999px`
- Schatten (nur zwei, mehr nicht):
  - `--shadow-card: 0 1px 2px rgba(30,27,57,.05), 0 1px 3px rgba(30,27,57,.04)`
  - `--shadow-float: 0 8px 30px rgba(30,27,57,.10)` (Dropdowns, Modals, Popover)
- Abstände: nur Vielfache von 4. Sektionsabstand `96px` Desktop / `56px` Mobil.
- Container: `max-w-[1200px]`, Innenabstand `24px`.

### Buttons — exakt vier Varianten, keine fünfte

| Variante | Aussehen | Einsatz |
|---|---|---|
| `primary` | Fläche `--color-ink`, weißer Text, `h-11 px-5 rounded-lg font-semibold` | Die **eine** Hauptaktion pro Screen |
| `accent` | Fläche `--color-accent`, weißer Text | Conversion-CTA („Check starten") |
| `soft` | Fläche `--color-accent-soft`, Text `--color-accent`, oft mit Pfeil `→` | Sekundär, „Mehr erfahren →" |
| `outline` | weiß, Rahmen `--color-line`, Text `--color-ink` | Abbrechen, Zurück, Nebenaktion |

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
