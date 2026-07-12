-- =====================================================================
-- KI-Drama — Datenbank-Schema
-- Einspielen: Supabase Dashboard → SQL Editor → einfügen → Run
-- Projekt-Region: EU (Frankfurt). Lässt sich nachträglich NICHT ändern.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Helper: Ist der eingeloggte Nutzer Admin?
-- ---------------------------------------------------------------------
create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- updated_at automatisch pflegen
-- ---------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- =====================================================================
-- LEADS  (Kern des CRM)
-- =====================================================================
create type lead_segment as enum ('privat', 'business');
create type lead_status  as enum ('neu', 'kontaktiert', 'termin_gebucht', 'gespraech_gefuehrt', 'kunde', 'kein_interesse');

create table leads (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  name         text not null,
  company      text,
  phone        text,
  segment      lead_segment not null default 'privat',
  status       lead_status  not null default 'neu',
  source       text default 'check',          -- check | kontaktformular | direkt
  consent_at   timestamptz not null,          -- DSGVO: Zeitpunkt der Einwilligung
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on leads (created_at desc);
create index on leads (status);
create index on leads (email);
create trigger t_leads_touch before update on leads for each row execute function touch_updated_at();

-- Timeline pro Lead (Notiz, Statuswechsel, Mail versendet, …)
create table lead_activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  kind       text not null,                   -- notiz | status | mail | termin
  body       text,
  meta       jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on lead_activities (lead_id, created_at desc);

-- =====================================================================
-- QUIZ  (Fragen im Admin pflegbar)
-- =====================================================================
create type question_type    as enum ('single', 'multi', 'scale', 'text');
create type question_segment as enum ('alle', 'privat', 'business');

create table quiz_questions (
  id         uuid primary key default gen_random_uuid(),
  position   int  not null,
  type       question_type    not null default 'single',
  segment    question_segment not null default 'alle',
  title      text not null,
  hint       text,
  options    jsonb not null default '[]'::jsonb,  -- [{value,label,description,icon}]
  required   boolean not null default true,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on quiz_questions (position);
create trigger t_questions_touch before update on quiz_questions for each row execute function touch_updated_at();

create table quiz_responses (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references leads(id) on delete cascade,
  session_id   text not null,                  -- gesetzt vor Mail-Eingabe (Abbrecher!)
  segment      lead_segment not null,
  answers      jsonb not null default '{}'::jsonb,  -- { question_id: answer }
  completed    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on quiz_responses (lead_id);
create unique index on quiz_responses (session_id);
create trigger t_responses_touch before update on quiz_responses for each row execute function touch_updated_at();

-- =====================================================================
-- KALENDER
-- =====================================================================
-- Wochenregeln: z.B. Di 09:00–12:00, Slotlänge 30 min
create table availability_rules (
  id            uuid primary key default gen_random_uuid(),
  weekday       int  not null check (weekday between 0 and 6),  -- 0=Sonntag
  start_time    time not null,
  end_time      time not null,
  slot_minutes  int  not null default 30,
  buffer_minutes int not null default 10,      -- Puffer zwischen Terminen
  active        boolean not null default true,
  check (end_time > start_time)
);

-- Ausnahmen: Urlaub, Feiertag, oder zusätzlicher Sondertermin
create table availability_exceptions (
  id         uuid primary key default gen_random_uuid(),
  day        date not null,
  blocked    boolean not null default true,    -- true = ganzer Tag zu
  start_time time,                             -- bei blocked=false: Extra-Fenster
  end_time   time,
  reason     text
);
create index on availability_exceptions (day);

create type booking_status as enum ('gebucht', 'abgesagt', 'wahrgenommen', 'nicht_erschienen');

create table bookings (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  starts_at     timestamptz not null,          -- IMMER UTC
  ends_at       timestamptz not null,
  status        booking_status not null default 'gebucht',
  meeting_url   text,
  manage_token  text not null default encode(gen_random_bytes(24), 'hex'),
  message       text,                          -- Freitext des Buchenden
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);
-- Doppelbuchung auf DB-Ebene verhindern (nur für aktive Buchungen):
create unique index bookings_no_double on bookings (starts_at) where status = 'gebucht';
create unique index on bookings (manage_token);
create index on bookings (starts_at);
create trigger t_bookings_touch before update on bookings for each row execute function touch_updated_at();

-- =====================================================================
-- INHALTE
-- =====================================================================
create type content_status as enum ('entwurf', 'veroeffentlicht');

create table posts (                            -- News-Artikel
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text not null,
  body          jsonb not null default '{}'::jsonb,   -- Tiptap-JSON
  cover_url     text,
  cover_alt     text,
  category      text not null default 'Allgemein',
  tags          text[] not null default '{}',
  status        content_status not null default 'entwurf',
  reading_min   int not null default 3,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on posts (status, published_at desc);
create trigger t_posts_touch before update on posts for each row execute function touch_updated_at();

create table chapters (                         -- Grundlagen-Kapitel
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  position    int  not null,
  title       text not null,
  summary     text not null,
  body        jsonb not null default '{}'::jsonb,
  level       text not null default 'einsteiger',   -- einsteiger | fortgeschritten
  status      content_status not null default 'entwurf',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger t_chapters_touch before update on chapters for each row execute function touch_updated_at();

create table tools (                            -- KI-Landschaft
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  vendor      text,
  category    text not null,                    -- Text | Bild | Audio | Code | Agenten | ...
  summary     text not null,                    -- neutral, 1–2 Sätze
  good_for    text[] not null default '{}',
  watch_out   text,                             -- Datenschutz-/Kostenhinweis
  logo_url    text,
  website     text,
  price_hint  text,                             -- "kostenlos / ab 20 $ / Monat"
  position    int not null default 0,
  status      content_status not null default 'entwurf',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on tools (category, position);
create trigger t_tools_touch before update on tools for each row execute function touch_updated_at();

create table media (                            -- Bildbibliothek
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique,             -- Pfad im Storage-Bucket
  url         text not null,
  alt         text not null,                    -- Pflicht!
  caption     text,
  width       int,
  height      int,
  bytes       int,
  created_at  timestamptz not null default now()
);

create table settings (                         -- Key-Value für Admin-Einstellungen
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger t_settings_touch before update on settings for each row execute function touch_updated_at();

create table email_log (
  id         uuid primary key default gen_random_uuid(),
  to_email   text not null,
  template   text not null,
  subject    text,
  status     text not null default 'gesendet',
  error      text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Grundsatz: anon darf NUR veröffentlichte Inhalte + aktive Fragen lesen.
-- Alles andere gehört dem Admin. Geschrieben wird nur serverseitig
-- (service_role umgeht RLS) — nie direkt aus dem Browser.
-- =====================================================================
alter table admins                  enable row level security;
alter table leads                   enable row level security;
alter table lead_activities         enable row level security;
alter table quiz_questions          enable row level security;
alter table quiz_responses          enable row level security;
alter table availability_rules      enable row level security;
alter table availability_exceptions enable row level security;
alter table bookings                enable row level security;
alter table posts                   enable row level security;
alter table chapters                enable row level security;
alter table tools                   enable row level security;
alter table media                   enable row level security;
alter table settings                enable row level security;
alter table email_log               enable row level security;

-- Öffentlich lesbar: nur was veröffentlicht bzw. aktiv ist
create policy pub_posts    on posts    for select to anon, authenticated using (status = 'veroeffentlicht');
create policy pub_chapters on chapters for select to anon, authenticated using (status = 'veroeffentlicht');
create policy pub_tools    on tools    for select to anon, authenticated using (status = 'veroeffentlicht');
create policy pub_media    on media    for select to anon, authenticated using (true);
create policy pub_questions on quiz_questions for select to anon, authenticated using (active = true);
-- Verfügbarkeiten müssen öffentlich lesbar sein, damit der Kalender freie Slots zeigt
create policy pub_rules      on availability_rules      for select to anon, authenticated using (active = true);
create policy pub_exceptions on availability_exceptions for select to anon, authenticated using (true);

-- Admin darf alles. Ein Statement pro Tabelle.
create policy adm_admins     on admins                  for all using (is_admin()) with check (is_admin());
create policy adm_leads      on leads                   for all using (is_admin()) with check (is_admin());
create policy adm_acts       on lead_activities         for all using (is_admin()) with check (is_admin());
create policy adm_questions  on quiz_questions          for all using (is_admin()) with check (is_admin());
create policy adm_responses  on quiz_responses          for all using (is_admin()) with check (is_admin());
create policy adm_rules      on availability_rules      for all using (is_admin()) with check (is_admin());
create policy adm_exceptions on availability_exceptions for all using (is_admin()) with check (is_admin());
create policy adm_bookings   on bookings                for all using (is_admin()) with check (is_admin());
create policy adm_posts      on posts                   for all using (is_admin()) with check (is_admin());
create policy adm_chapters   on chapters                for all using (is_admin()) with check (is_admin());
create policy adm_tools      on tools                   for all using (is_admin()) with check (is_admin());
create policy adm_media      on media                   for all using (is_admin()) with check (is_admin());
create policy adm_settings   on settings                for all using (is_admin()) with check (is_admin());
create policy adm_maillog    on email_log               for all using (is_admin()) with check (is_admin());

-- HINWEIS: leads, quiz_responses, bookings haben BEWUSST keine anon-Policy.
-- Sie sind aus dem Browser weder les- noch schreibbar. Schreiben erfolgt
-- ausschließlich über Next.js Route Handlers mit dem service_role-Key.

-- =====================================================================
-- STORAGE
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media lesbar für alle"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

create policy "media schreibbar nur für admin"
  on storage.objects for all to authenticated
  using (bucket_id = 'media' and is_admin())
  with check (bucket_id = 'media' and is_admin());

-- =====================================================================
-- STARTWERTE
-- =====================================================================
insert into settings (key, value) values
  ('meeting_url',    '"https://meet.jit.si/ki-drama-gespraech"'::jsonb),
  ('slot_minutes',   '30'::jsonb),
  ('lead_time_hours','24'::jsonb),           -- frühestmögliche Buchung ab jetzt +24h
  ('horizon_days',   '30'::jsonb),           -- wie weit im Voraus buchbar
  ('notify_email',   '"deine@mail.de"'::jsonb)
on conflict (key) do nothing;

-- Beispiel-Verfügbarkeit: Di + Do, 09:00–12:00 und 14:00–17:00
insert into availability_rules (weekday, start_time, end_time, slot_minutes) values
  (2, '09:00', '12:00', 30),
  (2, '14:00', '17:00', 30),
  (4, '09:00', '12:00', 30),
  (4, '14:00', '17:00', 30);

-- Beispiel-Fragen (im Admin später frei änderbar)
insert into quiz_questions (position, type, segment, title, hint, options) values
(1, 'multi', 'alle', 'Welche KI-Tools sagen dir etwas?', 'Mehrfachauswahl — einfach antippen',
 '[{"value":"chatgpt","label":"ChatGPT"},{"value":"claude","label":"Claude"},{"value":"gemini","label":"Gemini"},{"value":"copilot","label":"Microsoft Copilot"},{"value":"midjourney","label":"Midjourney"},{"value":"perplexity","label":"Perplexity"},{"value":"keins","label":"Ehrlich gesagt: keins davon"}]'::jsonb),
(2, 'multi', 'alle', 'Und welche nutzt du bereits regelmäßig?', 'Wenn keins: einfach überspringen',
 '[{"value":"chatgpt","label":"ChatGPT"},{"value":"claude","label":"Claude"},{"value":"gemini","label":"Gemini"},{"value":"copilot","label":"Microsoft Copilot"},{"value":"keins","label":"Noch keins"}]'::jsonb),
(3, 'single', 'alle', 'Wie würdest du dein KI-Wissen einschätzen?', null,
 '[{"value":"1","label":"Ich fange bei null an","description":"Ich weiß, dass es das gibt. Mehr nicht."},{"value":"2","label":"Ich habe rumprobiert","description":"Ein paar Fragen gestellt, mehr nicht."},{"value":"3","label":"Ich nutze es im Alltag","description":"Aber ohne echtes System."},{"value":"4","label":"Ich kenne mich aus","description":"Mir fehlt eher der Überblick über den Markt."}]'::jsonb),
(4, 'single', 'alle', 'Was ist gerade dein größtes Fragezeichen?', null,
 '[{"value":"funktion","label":"Wie funktioniert das überhaupt?"},{"value":"auswahl","label":"Was davon brauche ich wirklich?"},{"value":"datenschutz","label":"Darf ich das mit meinen Daten machen?"},{"value":"start","label":"Wo fange ich an?"},{"value":"angst","label":"Verpasse ich gerade etwas?"}]'::jsonb),
(5, 'single', 'business', 'Wie groß ist euer Team?', null,
 '[{"value":"solo","label":"Nur ich"},{"value":"2-9","label":"2–9"},{"value":"10-49","label":"10–49"},{"value":"50+","label":"50 und mehr"}]'::jsonb),
(6, 'single', 'business', 'Wo würdest du zuerst ansetzen?', 'Bauchgefühl reicht',
 '[{"value":"texte","label":"Texte & Kommunikation"},{"value":"orga","label":"Interne Abläufe"},{"value":"kunden","label":"Kundenkontakt"},{"value":"daten","label":"Daten & Auswertung"},{"value":"weissnicht","label":"Genau das weiß ich nicht"}]'::jsonb);
