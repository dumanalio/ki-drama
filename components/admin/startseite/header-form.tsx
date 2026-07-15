"use client";

import * as React from "react";
import { toast } from "sonner";

import { ButtonColorPicker } from "@/components/admin/einstellungen/button-color-picker";
import { LogoField } from "@/components/admin/einstellungen/logo-field";
import { Button } from "@/components/ui/button";
import { saveHeaderSettings } from "@/lib/actions/settings";
import type { GeneralSettings } from "@/lib/queries/admin-settings";

export function HeaderForm({
  logoUrl: initialLogoUrl,
  logoAlt: initialLogoAlt,
  logoHeight: initialLogoHeight,
  buttonColor: initialButtonColor,
  buttonCustomColor: initialButtonCustomColor,
  buttonTextColor: initialButtonTextColor,
  buttonTextCustomColor: initialButtonTextCustomColor,
}: {
  logoUrl: GeneralSettings["headerLogoUrl"];
  logoAlt: GeneralSettings["headerLogoAlt"];
  logoHeight: GeneralSettings["headerLogoHeight"];
  buttonColor: GeneralSettings["headerButtonColor"];
  buttonCustomColor: GeneralSettings["headerButtonCustomColor"];
  buttonTextColor: GeneralSettings["headerButtonTextColor"];
  buttonTextCustomColor: GeneralSettings["headerButtonTextCustomColor"];
}) {
  const [logoUrl, setLogoUrl] = React.useState(initialLogoUrl);
  const [logoAlt, setLogoAlt] = React.useState(initialLogoAlt);
  const [logoHeight, setLogoHeight] = React.useState(initialLogoHeight);
  const [buttonColor, setButtonColor] = React.useState(initialButtonColor);
  const [buttonCustomColor, setButtonCustomColor] = React.useState(
    initialButtonCustomColor
  );
  const [buttonTextColor, setButtonTextColor] = React.useState(
    initialButtonTextColor
  );
  const [buttonTextCustomColor, setButtonTextCustomColor] = React.useState(
    initialButtonTextCustomColor
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveHeaderSettings({
        headerLogoUrl: logoUrl,
        headerLogoAlt: logoAlt,
        headerLogoHeight: logoHeight,
        headerButtonColor: buttonColor,
        headerButtonCustomColor: buttonCustomColor,
        headerButtonTextColor: buttonTextColor,
        headerButtonTextCustomColor: buttonTextCustomColor,
      });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Header gespeichert");
    });
  }

  return (
    <div className="flex max-w-[720px] flex-col gap-6">
      <LogoField
        label='Logo (ersetzt den Schriftzug "KI-Drama" oben links)'
        imageUrl={logoUrl}
        imageAlt={logoAlt}
        height={logoHeight}
        onSelect={(url, alt) => {
          setLogoUrl(url);
          setLogoAlt(alt);
        }}
        onAltChange={setLogoAlt}
        onRemove={() => {
          setLogoUrl(null);
          setLogoAlt(null);
        }}
        onHeightChange={setLogoHeight}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-ink-muted text-[12px] font-medium">
          Farbe des Check-starten-Buttons oben rechts, auf jeder Seite
        </span>
        <ButtonColorPicker
          value={{
            color: buttonColor,
            customColor: buttonCustomColor,
            textColor: buttonTextColor,
            textCustomColor: buttonTextCustomColor,
          }}
          onChange={(next) => {
            setButtonColor(next.color);
            setButtonCustomColor(next.customColor);
            setButtonTextColor(next.textColor);
            setButtonTextCustomColor(next.textCustomColor);
          }}
        />
      </div>

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
