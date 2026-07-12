# Claude Code — Prompts nach Phasen

**So arbeitest du damit:**

1. Ordner anlegen, `CLAUDE.md` ins Root legen, diese Datei als `docs/prompts.md` daneben.
2. Terminal in VS Code öffnen → `claude` starten.
3. **Eine Phase** einfügen. Bauen lassen. `npm run dev` prüfen. Committen.
4. Erst dann die nächste Phase. Niemals zwei auf einmal — sonst verlierst du den Überblick
   und Claude auch.

Nach jeder Phase:
```bash
npm run build && git add -A && git commit -m "Phase X: ..." && git push
```

---

## Vorbereitung (machst du selbst, 15 Minuten)

- [ ] GitHub-Repo `ki-drama` anlegen (privat)
- [ ] Supabase-Projekt anlegen — **Region: Frankfurt (eu-central-1)**
- [ ] `supabase_schema.sql` im SQL-Editor ausführen
- [ ] In Supabase → Authentication → Users → dich selbst anlegen (E-Mail + Passwort)
- [ ] Deine `user_id` kopieren und in die `admins`-Tabelle eintragen:
      `insert into admins (user_id, email) values ('DEINE-UUID', 'deine@mail.de');`
- [ ] Resend-Account, Domain verifizieren
- [ ] Cloudflare-Account → Turnstile-Site anlegen
- [ ] Vercel-Account mit GitHub verbinden

---

## Phase 1 — Fundament

```
Wir starten das Projekt "KI-Drama". Lies zuerst CLAUDE.md vollständig und halte dich
strikt an das dort beschriebene Design-System.

Richte ein:
- Next.js 15 mit App Router, TypeScript (strict), Tailwind CSS v4, ESLint, Prettier
- shadcn/ui initialisieren
- Schriften Plus Jakarta Sans (Display) und Inter (Body) über next/font/google
- globals.css mit exakt den Farb-, Radius- und Schatten-Tokens aus CLAUDE.md unter @theme
- Supabase-Clients: lib/supabase/client.ts (Browser, anon),
  lib/supabase/server.ts (Server Component, anon, mit Cookies),
  lib/supabase/admin.ts (service_role — mit einem Kommentar, dass diese Datei
  NIEMALS in eine Client Component importiert werden darf)
- lib/time.ts mit formatBerlin(), toUtc(), berlinDayRange() — die einzige Stelle im
  Projekt, an der Zeitzonen umgerechnet werden
- .env.example mit allen Variablen aus dem Projektplan
- Ordnerstruktur: app/(site) für öffentliche Seiten, app/(admin) für /admin,
  app/api für Route Handlers, components/ui, components/site, components/admin,
  lib/, types/

Erzeuge außerdem types/database.ts mit den TypeScript-Typen zu meinem Schema
(die Datei supabase_schema.sql liegt in docs/).

Danach: eine leere Startseite, die die Schriften und Farben demonstriert. Sonst nichts.
```

---

## Phase 2 — Design-System als Komponenten

```
Baue jetzt die Basiskomponenten. Referenz ist ausschließlich CLAUDE.md.

components/ui/:
- Button: Varianten primary | accent | soft | outline, Größen sm | md | lg,
  optionaler Pfeil rechts, Ladezustand mit Spinner, disabled
- Input, Textarea, Select, Checkbox, RadioCard (große klickbare Karte mit Titel,
  optionaler Beschreibung, Auswahl-Indikator rechts oben)
- Card (weiß, radius 12, shadow-card, optionaler Header mit Titel + Aktion rechts)
- Badge (soft | success | warning | danger | signal)
- Callout (Hinweisbox: accent-soft, radius 12, optionales Schließen-X)
- CheckList (Häkchenliste mit kreisförmigem Check-Icon in accent)
- Modal (rounded-2xl, shadow-float, Titel + X, Footer rechts: outline "Abbrechen" +
  primary Hauptaktion)
- Skeleton, EmptyState (Icon, Titel, Erklärung, ein Button), ErrorState

components/site/:
- Header: weiß, Logo links, Navigation Mitte (Grundlagen, Landschaft, News, Über mich),
  rechts "Check starten" als accent-Button. Mobil: Burger → Vollbild-Overlay.
- Footer: schlicht, 3 Spalten + Impressum/Datenschutz-Zeile
- Section: Wrapper mit Container max-w-[1200px] und Sektionsabstand
- SplitSection: links Text (Eyebrow, H2, Absatz, optional CheckList, optional Button),
  rechts Slot für eine Bildkachel (rounded-[20px]). Mobil untereinander.

Icons: lucide-react.
Lege /styleguide an, wo alle Komponenten in allen Varianten untereinander stehen.
Diese Seite behalten wir dauerhaft — sie ist unser Kontrollblick.
```

---

## Phase 3 — Öffentliche Seiten

```
Baue die öffentlichen Seiten als Server Components. Daten aus Supabase (anon-Key,
nur veröffentlichte Inhalte). Wenn noch keine Daten da sind: EmptyState zeigen,
keine Platzhalter-Blindtexte.

/ (Landing) — in dieser Reihenfolge:
  1. Hero: H1, ein Satz Untertitel, accent-Button "Check starten" +
     soft-Button "Erst mal verstehen →". Rechts eine ruhige Bildkachel.
  2. Das Problem: drei Karten (Überflutung / Unsicherheit / Uninformierte Teams)
  3. Was du hier bekommst: SplitSection x2 (Grundlagen, Landschaft)
  4. Neueste Beiträge: 3 Post-Karten aus der DB
  5. Abschluss-CTA: breite Karte in ink-Farbe, weißer Text, accent-Button

/grundlagen        Kapitel-Karten, sortiert nach position, gruppiert nach level
/grundlagen/[slug] Kapitel: Titel, Lesezeit, Tiptap-JSON gerendert, "Nächstes Kapitel"
/landschaft        Tool-Karten, filterbar nach Kategorie (Client-Component nur für
                   den Filter). Jede Karte: Logo, Name, Kategorie-Badge, neutrale
                   Zusammenfassung, "Gut für"-Liste, Preis-Hinweis, ggf. watch_out
                   als kleiner Warnhinweis. KEINE Empfehlungen, KEINE Bewertungen.
/news              Liste mit Kategorie-Filter, Coverbild, Titel, Auszug, Datum, Lesezeit
/news/[slug]       Artikel + generateMetadata für OpenGraph
/ueber-mich, /kontakt, /impressum, /datenschutz  (letzte zwei erstmal als Gerüst)

Schreibe einen Renderer lib/tiptap-render.tsx, der Tiptap-JSON zu React rendert
(Überschriften, Absätze, Listen, Zitate, Bilder via next/image, Links, Code).
```

---

## Phase 4 — Der Check (Funnel)

```
Baue /check als mehrstufigen Funnel. Das ist die wichtigste Seite der Website —
sie muss sich leicht anfühlen.

Verhalten:
- Ein Schritt pro Screen. Oben ein dünner Fortschrittsbalken. Zurück-Pfeil links oben.
- Schritt 0: Segment-Wahl (Privat / Unternehmen) als zwei große RadioCards.
- Danach werden die Fragen aus quiz_questions geladen, gefiltert nach
  segment IN ('alle', gewähltes Segment), sortiert nach position.
- Typ 'single': Klick auf Karte wählt aus UND geht automatisch weiter (300 ms Verzögerung).
- Typ 'multi': Auswahl + expliziter "Weiter"-Button.
- Tastatur: Zahlen 1–9 wählen Optionen, Enter = weiter, Backspace = zurück.
- Zwischenstand in sessionStorage, damit ein Reload nichts zerstört.
- Vorletzter Schritt: Name, E-Mail, (bei Unternehmen: Firma), Einwilligungs-Checkbox
  mit Link zur Datenschutzerklärung. Turnstile unsichtbar.
- Absenden → POST /api/check
- Danach Weiterleitung auf /check/termin?session=...

POST /api/check (Route Handler, service_role):
- Zod-Validierung
- Turnstile-Token serverseitig prüfen, sonst 400
- Rate-Limit: max. 5 Absendungen pro IP pro Stunde (einfacher In-Memory- oder
  Supabase-basierter Zähler)
- Lead anlegen (bei bereits existierender E-Mail: aktualisieren, nicht duplizieren),
  consent_at = now()
- quiz_responses speichern, mit lead_id verknüpfen, completed = true
- lead_activities-Eintrag "Check abgeschlossen"
- Zwei Mails via Resend:
  a) an mich (ADMIN_NOTIFY_EMAIL): alle Antworten in Klartext, Betreff
     "Neuer Check: {Name} ({Segment})"
  b) an den Lead: kurze Bestätigung + Link zur Terminwahl
- Beide Mails in email_log protokollieren
- Antwort: { leadId, sessionId }

Wichtig: Der Lead ist gespeichert, BEVOR der Kalender kommt. Wer beim Termin
abspringt, bleibt trotzdem im CRM.
```

---

## Phase 5 — Kalender & Buchung

```
Baue die Terminbuchung. Alle Zeitstempel in der DB sind UTC, Anzeige in Europe/Berlin
über lib/time.ts. Nirgendwo sonst Zeitzonen-Logik.

lib/availability.ts — Slot-Berechnung (reine Funktion, serverseitig):
- Eingabe: Zeitraum
- Aus availability_rules die Wochenregeln nehmen, in konkrete Slots auflösen
- availability_exceptions anwenden (blocked = Tag raus; sonst Extra-Fenster hinzu)
- Bereits gebuchte Slots (bookings.status = 'gebucht') abziehen, inkl. buffer_minutes
- lead_time_hours (frühestens ab jetzt + X) und horizon_days (max. Y Tage voraus)
  aus settings anwenden
- Ausgabe: Map von Datum → Liste freier Slots

/check/termin:
- Zwei Spalten: links Monatskalender (Tage ohne freie Slots ausgegraut und nicht
  klickbar), rechts die Slots des gewählten Tages als Liste von Buttons.
- Mobil: Kalender oben, Slots darunter, Button-Grid 2-spaltig.
- Unter der Slot-Liste: Zeitzonen-Hinweis ("Alle Zeiten in deutscher Zeit").
- Slot anklicken → Bestätigungs-Modal (Termin, Dauer, optionales Freitextfeld
  "Worum geht's konkret?") → "Termin buchen"

POST /api/booking:
- Zod + erneute serverseitige Prüfung, ob der Slot WIRKLICH noch frei ist
- Buchung anlegen. Bei unique-Verletzung (Doppelbuchung im selben Moment):
  409 mit klarer Meldung "Dieser Termin wurde gerade vergeben. Bitte wähle einen anderen."
  und Slots neu laden.
- Lead-Status auf 'termin_gebucht'
- lead_activities-Eintrag
- Bestätigungsmail an den Lead: Termin, Meeting-Link aus settings, Absage-Link
  /termin/{manage_token}, .ics-Datei im Anhang
- Benachrichtigung an mich
- Weiterleitung auf /check/danke

/termin/[token]:
- Termin anzeigen. Buttons "Verschieben" (zurück in die Slot-Auswahl) und
  "Absagen" (mit Rückfrage). Bei Absage: status = 'abgesagt', Slot wird wieder frei,
  Mail an mich.
- Ungültiger Token → freundliche 404, kein technischer Fehler.

/api/ics/[token] — generiert die Kalenderdatei.
```

---

## Phase 6 — Admin: Login & Dashboard

```
Baue den Admin-Bereich. Zugang nur für Nutzer, die in der Tabelle admins stehen.

/admin/login: zentrierte weiße Karte auf canvas-Hintergrund, Logo, "Anmelden",
E-Mail + Passwort, primary-Button. Bei falschen Daten: klare Fehlermeldung
über dem Formular, keine Weiterleitung.

Schutz — doppelt, nicht nur einfach:
- middleware.ts: prüft die Supabase-Session für /admin/*, leitet sonst auf /admin/login
- ZUSÄTZLICH in jedem Admin-Layout serverseitig prüfen, ob der Nutzer in admins steht.
  Middleware allein reicht nicht aus.

Admin-Layout: Sidebar 240px weiß (Dashboard, Leads, Termine, News, Landschaft,
Grundlagen, Fragen, Medien, Einstellungen), Gruppen-Label "VERWALTEN" in 11px
uppercase muted, aktiver Eintrag fett mit accent-farbenem Icon, unten dein Name +
Abmelden. Content auf canvas. Seiten-Header: H1 links, Primäraktion rechts oben.
Mobil: Sidebar wird zu einem Off-Canvas-Menü.

/admin (Dashboard):
- Vier Kennzahl-Karten: Leads (7 Tage), Termine (kommende), Abschlussrate des Checks,
  veröffentlichte Beiträge
- "Nächste Termine": Liste mit Name, Zeit, Segment, Link zum Lead
- "Neueste Leads": letzte 5, mit Status-Badge
- Balkendiagramm Leads/Tag der letzten 30 Tage (recharts)
```

---

## Phase 7 — CRM

```
/admin/leads — TanStack Table:
Spalten: Name, E-Mail, Segment-Badge, Status-Badge, Termin, Quelle, Erstellt.
Volltextsuche, Filter nach Status und Segment, Sortierung, Seitengröße 25.
CSV-Export der aktuellen Ansicht. Zeile klicken → Detailseite.

/admin/leads/[id] — zwei Spalten:
Links:
  - Kopf: Name, Firma, E-Mail (klickbar), Telefon, Segment
  - Status ändern über Dropdown (schreibt automatisch in lead_activities)
  - "Alle Antworten": jede Quiz-Frage mit der gegebenen Antwort, gut lesbar,
    Mehrfachantworten als Badge-Reihe
  - Termin, falls vorhanden: Zeit, Status, Meeting-Link, Absagen-Button
Rechts:
  - Notizfeld (Freitext, speichert in leads.notes, Autosave nach 800 ms Pause)
  - Timeline aus lead_activities, neueste oben, mit Icons je Typ
  - "Notiz hinzufügen"

/admin/termine:
- Tab 1 "Buchungen": Liste kommend/vergangen, Status ändern (wahrgenommen /
  nicht erschienen), absagen
- Tab 2 "Verfügbarkeit": Wochenregeln pflegen (Wochentag, von, bis, Slotlänge,
  Puffer, aktiv) als editierbare Zeilen. Darunter Ausnahmen: Datum blockieren
  (Urlaub) oder Extra-Fenster öffnen. Ein Vorschau-Kalender rechts zeigt sofort,
  welche Slots daraus entstehen.

Alle Schreibvorgänge über Server Actions mit Rechteprüfung. Nach jeder Änderung:
revalidatePath.
```

---

## Phase 8 — Inhaltspflege

```
/admin/news:
- Liste: Cover-Thumbnail, Titel, Kategorie, Status-Badge, Datum, Aktionen
- "Neuer Beitrag" → Editor
- Editor: zweispaltig. Links Tiptap (Überschriften H2/H3, fett, kursiv, Listen,
  Zitat, Link, Bild aus der Medienbibliothek, Trenner, Code). Rechts eine Seitenleiste:
  Slug (automatisch aus Titel, überschreibbar), Auszug, Kategorie, Tags, Coverbild
  + Alt-Text, Lesezeit (automatisch geschätzt), Status.
- Oben rechts: outline "Vorschau" (öffnet /news/[slug]?preview=1) und primary
  "Veröffentlichen" bzw. "Änderungen speichern".
- Autosave als Entwurf alle 10 Sekunden, mit dezenter Statusanzeige "Gespeichert".

/admin/medien — das muss richtig gut sein:
- Drag & Drop auf eine große gestrichelte Fläche, oder Klick zum Auswählen
- Beim Upload: Vorschau sofort, Fortschrittsbalken, Upload in den Supabase-
  Storage-Bucket "media", Eintrag in der media-Tabelle
- Nach dem Upload öffnet sich automatisch ein Feld für den Alt-Text — PFLICHT,
  ohne Alt-Text wird nicht gespeichert. Bildunterschrift optional.
- Bibliothek als Raster mit großen Vorschaubildern. Klick öffnet ein Modal:
  großes Bild, Alt-Text und Bildunterschrift bearbeiten, Maße, Dateigröße,
  URL kopieren, Löschen (mit Rückfrage).
- Suche über Alt-Text und Dateiname.
- Bilder vor dem Upload im Browser auf max. 2000px Kantenlänge verkleinern und
  nach WebP konvertieren (browser-image-compression).

/admin/landschaft und /admin/grundlagen: Formulare analog, Drag-and-drop-Sortierung
über das Feld position.

/admin/fragen:
- Fragen als sortierbare Liste (Drag & Drop ändert position)
- Bearbeiten: Typ, Segment, Titel, Hinweis, Optionen (Zeilen hinzufügen/entfernen),
  Pflichtfeld, aktiv
- Live-Vorschau rechts, wie die Frage im Check aussieht

/admin/einstellungen: Meeting-Link, Slotlänge, Vorlaufzeit, Buchungshorizont,
Benachrichtigungs-E-Mail, Texte für die Bestätigungsmails.
```

---

## Phase 9 — Feinschliff

```
Geh das gesamte Projekt durch und arbeite ab:

1. Mobil: jede Seite bei 360, 390 und 768px prüfen. Kein horizontales Scrollen.
   Klickflächen mindestens 44px hoch. Der Check muss sich mit einem Daumen bedienen
   lassen.
2. Zustände: Für jede Datenansicht Laden (Skeleton), leer (EmptyState mit nächstem
   Schritt), Fehler (was ist passiert, was tun). Nirgendwo ein weißer Bildschirm.
3. Fehlertexte prüfen: konkret, ohne Entschuldigung, ohne "Etwas ist schiefgelaufen".
4. SEO: generateMetadata auf allen öffentlichen Seiten, OpenGraph-Bilder,
   sitemap.ts, robots.ts, JSON-LD (Article für News, Organization für die Startseite).
5. Barrierefreiheit: Fokus überall sichtbar, Landmarks, alt-Texte, Kontrast prüfen,
   Modal fängt den Fokus, Escape schließt.
6. Performance: next/image überall, Fonts mit display: swap, kein unnötiges
   "use client". Lighthouse über 90 in allen vier Kategorien.
7. prefers-reduced-motion respektieren.
8. 404- und error.tsx-Seiten im Stil der Website.
9. Sicherheits-Durchgang: Suche im gesamten Repo nach SUPABASE_SERVICE_ROLE_KEY und
   stelle sicher, dass er in KEINER Datei landet, die im Client gebündelt wird.
   Prüfe jede Tabelle: RLS aktiv? Prüfe jede Admin-Route: serverseitige Rechteprüfung
   vorhanden? Liste mir das Ergebnis auf.
```

---

## Danach

- Domain bei Vercel verbinden, DNS setzen
- Alle Umgebungsvariablen in Vercel eintragen (Production **und** Preview)
- Supabase → Auth → URL Configuration: deine Domain eintragen
- Erste echte Inhalte pflegen: 5 Grundlagen-Kapitel, 10 Tool-Karten, 3 News-Beiträge
- Selbst einen Testtermin buchen und alle Mails prüfen
- Impressum und Datenschutzerklärung fertigstellen (bei personenbezogenen Daten
  und einem Buchungssystem lohnt sich ein Blick von jemandem, der sich damit auskennt)
