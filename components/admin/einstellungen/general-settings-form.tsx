"use client";

import * as React from "react";
import { toast } from "sonner";

import { ButtonColorPicker } from "@/components/admin/einstellungen/button-color-picker";
import { LogoField } from "@/components/admin/einstellungen/logo-field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveGeneralSettings } from "@/lib/actions/settings";
import type { GeneralSettings } from "@/lib/queries/admin-settings";

export function GeneralSettingsForm({
  settings,
}: {
  settings: GeneralSettings;
}) {
  const [meetingUrl, setMeetingUrl] = React.useState(settings.meetingUrl);
  const [slotMinutes, setSlotMinutes] = React.useState(settings.slotMinutes);
  const [leadTimeHours, setLeadTimeHours] = React.useState(
    settings.leadTimeHours
  );
  const [horizonDays, setHorizonDays] = React.useState(settings.horizonDays);
  const [notifyEmail, setNotifyEmail] = React.useState(settings.notifyEmail);
  const [emailConfirmationNote, setEmailConfirmationNote] = React.useState(
    settings.emailConfirmationNote
  );
  const [emailSignoff, setEmailSignoff] = React.useState(settings.emailSignoff);
  const [headerButtonColor, setHeaderButtonColor] = React.useState(
    settings.headerButtonColor
  );
  const [headerButtonCustomColor, setHeaderButtonCustomColor] = React.useState(
    settings.headerButtonCustomColor
  );
  const [headerButtonTextColor, setHeaderButtonTextColor] = React.useState(
    settings.headerButtonTextColor
  );
  const [headerButtonTextCustomColor, setHeaderButtonTextCustomColor] =
    React.useState(settings.headerButtonTextCustomColor);
  const [headerLogoUrl, setHeaderLogoUrl] = React.useState(
    settings.headerLogoUrl
  );
  const [headerLogoAlt, setHeaderLogoAlt] = React.useState(
    settings.headerLogoAlt
  );
  const [headerLogoHeight, setHeaderLogoHeight] = React.useState(
    settings.headerLogoHeight
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveGeneralSettings({
        meetingUrl,
        slotMinutes,
        leadTimeHours,
        horizonDays,
        notifyEmail,
        emailConfirmationNote,
        emailSignoff,
        headerButtonColor,
        headerButtonCustomColor,
        headerButtonTextColor,
        headerButtonTextCustomColor,
        headerLogoUrl,
        headerLogoAlt,
        headerLogoHeight,
      });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Einstellungen gespeichert");
    });
  }

  return (
    <div className="flex max-w-[720px] flex-col gap-6">
      <Card>
        <CardHeader title="Kalender" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-ink-muted text-[12px] font-medium">
              Meeting-Link
            </span>
            <Input
              value={meetingUrl}
              onChange={(event) => setMeetingUrl(event.target.value)}
              placeholder="https://…"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Slotlänge (Minuten)
            </span>
            <Input
              type="number"
              min={5}
              max={240}
              value={slotMinutes}
              onChange={(event) => setSlotMinutes(Number(event.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Vorlaufzeit (Stunden)
            </span>
            <Input
              type="number"
              min={0}
              max={720}
              value={leadTimeHours}
              onChange={(event) => setLeadTimeHours(Number(event.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Buchungshorizont (Tage)
            </span>
            <Input
              type="number"
              min={1}
              max={365}
              value={horizonDays}
              onChange={(event) => setHorizonDays(Number(event.target.value))}
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Header" />
        <div className="flex flex-col gap-5">
          <LogoField
            label='Logo (ersetzt den Schriftzug "KI-Drama" oben links)'
            imageUrl={headerLogoUrl}
            imageAlt={headerLogoAlt}
            height={headerLogoHeight}
            onSelect={(url, alt) => {
              setHeaderLogoUrl(url);
              setHeaderLogoAlt(alt);
            }}
            onAltChange={setHeaderLogoAlt}
            onRemove={() => {
              setHeaderLogoUrl(null);
              setHeaderLogoAlt(null);
            }}
            onHeightChange={setHeaderLogoHeight}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-ink-muted text-[12px] font-medium">
              Farbe des Check-starten-Buttons oben rechts, auf jeder Seite
            </span>
            <ButtonColorPicker
              value={{
                color: headerButtonColor,
                customColor: headerButtonCustomColor,
                textColor: headerButtonTextColor,
                textCustomColor: headerButtonTextCustomColor,
              }}
              onChange={(next) => {
                setHeaderButtonColor(next.color);
                setHeaderButtonCustomColor(next.customColor);
                setHeaderButtonTextColor(next.textColor);
                setHeaderButtonTextCustomColor(next.textCustomColor);
              }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Benachrichtigungen" />
        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px] font-medium">
            Benachrichtigungs-E-Mail
          </span>
          <Input
            type="email"
            value={notifyEmail}
            onChange={(event) => setNotifyEmail(event.target.value)}
            placeholder="du@beispiel.de"
          />
        </label>
      </Card>

      <Card>
        <CardHeader title="Texte der Bestätigungsmails" />
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Zusätzlicher Hinweis (optional)
            </span>
            <Textarea
              value={emailConfirmationNote}
              onChange={(event) => setEmailConfirmationNote(event.target.value)}
              placeholder="Wird nach der Terminbestätigung eingefügt, z. B. Vorbereitungshinweise."
              className="min-h-[90px]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Grußformel
            </span>
            <Textarea
              value={emailSignoff}
              onChange={(event) => setEmailSignoff(event.target.value)}
              className="min-h-[70px]"
            />
          </label>
        </div>
      </Card>

      {error ? (
        <p role="alert" className="text-danger text-[14px]">
          {error}
        </p>
      ) : null}

      <Button
        variant="primary"
        onClick={handleSave}
        loading={isSaving}
        className="self-start"
      >
        Speichern
      </Button>
    </div>
  );
}
