# KI-Drama — Projektplan & Fundament

> Einführung in die KI-Welt. Kein Verkauf von Tools, sondern Orientierung:
> Grundlagen verstehen → Landschaft kennen → Potenzial einschätzen → Gespräch buchen.

---

## 1. Was das Produkt tatsächlich ist

Drei Dinge, sonst nichts. Alles andere ist Ablenkung.

| Baustein | Zweck | Für wen |
|---|---|---|
| **Wissen** (Grundlagen, KI-Landschaft, News) | Verstehen statt hinterherrennen | Besucher |
| **Der Check** (Kurz-Umfrage → Termin) | Qualifizierter Lead + Kalendertermin | Besucher |
| **Admin/CRM** | Leads sehen, Inhalte pflegen, Termine verwalten | Nur du |

Der Besucher braucht **keinen Account**. Er beantwortet 6–8 Fragen, gibt seine Mail ein, bucht einen Slot. Fertig. Ein Login würde die Conversion killen und dich zu einer Nutzerverwaltung zwingen, die du nicht brauchst.

**Statt Login:** Jede Buchung bekommt einen geheimen `manage_token`. Der Link in der Bestätigungsmail (`/termin/abc123xyz`) erlaubt Absagen/Verschieben — ohne Passwort, ohne Datenbank für Nutzer. Das ist der professionelle Standard (macht Calendly genauso).

**Privat / Unternehmen:** Kein Login-Switch, sondern ein Segment-Switch **ganz am Anfang des Checks**. Er steuert, welche Fragen kommen und welche Sprache die Auswertung spricht. Ein Feld in der Datenbank (`segment: 'privat' | 'business'`), mehr nicht.

---

## 2. Tech-Stack

| Ebene | Wahl | Warum |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript) | Vercel-nativ, Server Components, beste Bild-Optimierung |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | Design-Tokens als CSS-Variablen, kein Framework-Look |
| Datenbank/Auth/Storage | **Supabase** | Postgres + Auth (nur für dich) + Storage für Bilder |
| E-Mail | **Resend** + **React Email** | 3.000 Mails/Monat gratis, saubere Templates |
| Editor (News) | **Tiptap** | WYSIWYG, speichert sauberes JSON, kein Markdown-Frust |
| Formulare | **react-hook-form** + **Zod** | Validierung einmal definiert, Client + Server |
| Tabellen (CRM) | **TanStack Table** | Sortieren, Filtern, Suchen im Lead-Board |
| Spam-Schutz | **Cloudflare Turnstile** | DSGVO-freundlicher als reCAPTCHA, unsichtbar |
| Analytics | **Plausible** oder **Umami** | Cookielos → kein Cookie-Banner nötig |
| Hosting | **Vercel** + **GitHub** | Push = Deploy |

**Bewusst nicht dabei:** Cal.com-Einbettung. Du willst maximale Kontrolle und alles im eigenen Admin — also bauen wir den Kalender selbst (ist bei einem Terminstyp mit festen Slots nur eine Tabelle plus etwas Logik). Kein Fremd-Widget, kein fremder Style, keine externe Abhängigkeit.

---

## 3. Sitemap

```
ÖFFENTLICH
/                        Landing: Problem → Was du hier verstehst → Check-CTA
/grundlagen              KI-Basics in Kapiteln (Was ist ein Modell? Was ist ein Token? …)
/grundlagen/[slug]       Einzelnes Kapitel
/landschaft              Was es aktuell gibt: Tool-Karten, filterbar, neutral beschrieben
/news                    Artikel-Liste (Kategorien, Suche)
/news/[slug]             Artikel
/check                   Der Funnel (Schritt 1..n, eine Frage pro Screen)
/check/termin            Kalender: Tag wählen → Slot wählen
/check/danke             Bestätigung + Kalenderdatei (.ics)
/termin/[token]          Termin ansehen / verschieben / absagen
/ueber-mich
/kontakt
/impressum  /datenschutz   ← Pflicht in DE, nicht optional

ADMIN  (/admin/* — geschützt via Middleware, nur dein Supabase-Account)
/admin                   Dashboard: Leads heute, offene Termine, Quiz-Abschlussrate
/admin/leads             CRM-Tabelle: Name, Mail, Segment, Status, Termin, Quelle
/admin/leads/[id]        Lead-Detail: alle Quiz-Antworten, Notizen, Timeline, Status ändern
/admin/termine           Buchungen + Verfügbarkeiten pflegen (Wochenregeln + Ausnahmen)
/admin/news              Artikel-Liste → Editor (Tiptap), Entwurf/Veröffentlicht
/admin/landschaft        Tool-Karten pflegen
/admin/grundlagen        Kapitel pflegen
/admin/fragen            Quiz-Fragen pflegen (Reihenfolge, Typ, Antworten, Segment)
/admin/medien            Bild-Upload mit Vorschau, Alt-Text, Bildunterschrift
/admin/einstellungen     Texte, Mail-Vorlagen, Meeting-Link, Slot-Länge
```

---

## 4. Der Check — so fühlt er sich an

Ein Screen. Eine Frage. Große Klick-Karten, kein Tippen (außer bei der Mail).
Fortschrittsbalken oben. `Enter` oder Klick = weiter. Zurück ist jederzeit möglich.

```
Schritt 0   Bist du privat unterwegs oder für ein Unternehmen?   [Privat] [Unternehmen]
Schritt 1   Welche KI-Tools kennst du?                            Mehrfachauswahl, Karten
Schritt 2   Welche nutzt du schon aktiv?                          Mehrfachauswahl
Schritt 3   Wie würdest du dein KI-Wissen einschätzen?            1 von 4
Schritt 4   Was ist dein größtes Fragezeichen?                    1 von 5
Schritt 5   [nur Unternehmen] Wie viele Mitarbeitende?            1 von 4
Schritt 6   [nur Unternehmen] Wo würdest du zuerst ansetzen?      1 von 5
Schritt 7   Wie erreiche ich dich?                                Name + E-Mail (+ Firma)
            → Antworten werden gespeichert, Mail an dich raus
Schritt 8   Termin wählen                                         Kalender
```

Wichtig: **Antworten werden schon nach Schritt 7 gespeichert.** Wenn jemand beim Kalender abspringt, hast du den Lead trotzdem. Der Termin wird nachträglich an denselben Lead gehängt.

---

## 5. Reihenfolge des Bauens

Nicht alles auf einmal. In dieser Reihenfolge, jede Phase lauffähig:

1. **Setup** — Next.js, Tailwind, Supabase-Client, Design-Tokens, Deploy auf Vercel
2. **Design-System** — Button, Card, Input, Badge, Nav, Footer als Komponenten
3. **Datenbank** — Schema einspielen, RLS, Storage-Bucket
4. **Öffentliche Seiten** — Landing, Grundlagen, Landschaft, News (erstmal mit Testdaten)
5. **Der Check** — Funnel + Speicherung + Mail an dich
6. **Kalender** — Verfügbarkeiten, Slot-Berechnung, Buchung, Bestätigungsmails, .ics
7. **Admin-Login + Dashboard**
8. **CRM (Leads)**
9. **Inhaltspflege (News, Landschaft, Grundlagen, Fragen, Medien)**
10. **Feinschliff** — Mobile, Ladezustände, leere Zustände, Fehlermeldungen, SEO

---

## 6. Sicherheit — das ist der Teil, den man nicht falsch machen darf

**Alle Schreibvorgänge laufen serverseitig.** Der Browser bekommt niemals den `service_role`-Key zu sehen. Konkret:

- Öffentliche Seiten lesen mit dem `anon`-Key (RLS erlaubt nur `status = 'published'`).
- Formulare schicken an Next.js Route Handlers (`/api/...`). Erst dort wird mit erhöhten Rechten geschrieben.
- RLS ist auf **jeder** Tabelle aktiv. Keine Ausnahme. `leads`, `bookings`, `quiz_responses` sind für `anon` **nicht lesbar** — sonst könnte jeder deine Kundendaten abziehen.
- Turnstile-Token wird serverseitig geprüft, bevor irgendetwas gespeichert wird.
- Admin-Zugang: dein Supabase-Auth-Account, geprüft in `middleware.ts` **und** zusätzlich in jeder Admin-Route (nie nur in der Middleware).

**DSGVO, weil du in Deutschland sitzt:**
- Supabase-Region auf **EU (Frankfurt)** stellen. Beim Anlegen des Projekts, nachträglich geht das nicht.
- Impressum + Datenschutzerklärung ab Tag 1. Checkbox mit Link zur Datenschutzerklärung im Check.
- Fonts selbst hosten (`next/font/local` oder `next/font/google` — Next lädt sie zur Buildzeit herunter, es geht kein Request des Besuchers an Google).
- Cookieloses Analytics → kein Banner. Spart dir Conversion und Nerven.
- Auftragsverarbeitungsverträge bei Vercel, Supabase, Resend abschließen (gibt's überall online zum Anklicken).

---

## 7. Umgebungsvariablen

```bash
# .env.local  (und identisch in Vercel unter Settings → Environment Variables)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # NIEMALS mit NEXT_PUBLIC_ beginnen lassen
RESEND_API_KEY=
ADMIN_NOTIFY_EMAIL=                 # deine Mailadresse für neue Leads
NEXT_PUBLIC_SITE_URL=https://ki-drama.de
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

`.env.local` gehört in `.gitignore`. Prüf das, bevor du das erste Mal pushst.

---

## 8. Ehrliche Hinweise

**Zum Namen.** „KI-Drama" ist merkfähig und trifft dein Problem („alle sind hektisch, keiner versteht's"). Aber er kann auch als Panikmache gelesen werden — also als das, wogegen du eigentlich antrittst. Fang das im Untertitel ab, z. B.: *„KI-Drama — die Aufregung ist groß, die Erklärung fehlt."* Domain früh sichern.

**Der Kalender ist der Teil, der Zeit frisst.** Zeitzonen, Doppelbuchungen, Sommerzeit. Deshalb: alle Zeitstempel als `timestamptz` in **UTC** speichern, nur bei der Anzeige nach `Europe/Berlin` umrechnen. Ein `UNIQUE`-Index auf `starts_at` verhindert Doppelbuchungen auf Datenbankebene — nicht in der App-Logik, dort kannst du dich vertun.

**Fang mit einem Terminstyp an.** „Kennenlernen, 30 Minuten, online." Mehrere Terminarten kannst du später ergänzen, die Tabelle ist dafür vorbereitet.

**Mach den Meeting-Link nicht kompliziert.** Ein fester Jitsi-/Zoom-Raum in den Einstellungen, der in die Bestätigungsmail wandert. Automatische Google-Meet-Erstellung pro Termin ist ein eigenes Projekt (OAuth) — später.

**Bilder:** Upload in Supabase Storage, ausgeliefert über `next/image`. Alt-Text ist ein Pflichtfeld im Admin — nicht optional. Das ist gut für SEO, Barrierefreiheit und zwingt dich, sauber zu arbeiten.
