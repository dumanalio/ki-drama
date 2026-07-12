"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AvailabilityPreview } from "@/components/admin/termine/availability-preview";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  createAvailabilityException,
  createAvailabilityRule,
  deleteAvailabilityException,
  deleteAvailabilityRule,
  updateAvailabilityException,
  updateAvailabilityRule,
} from "@/lib/actions/availability";
import { computeAvailability } from "@/lib/availability";
import type { AvailabilityEditorData } from "@/lib/queries/admin-termine";
import type { AvailabilityException, AvailabilityRule } from "@/types/database";

const WEEKDAY_LABELS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

function randomKey(): string {
  return `new-${Math.random().toString(36).slice(2)}`;
}

interface RuleRow {
  key: string;
  id: string | null;
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  bufferMinutes: number;
  active: boolean;
}

function ruleToRow(rule: AvailabilityRule): RuleRow {
  return {
    key: rule.id,
    id: rule.id,
    weekday: rule.weekday,
    startTime: rule.start_time.slice(0, 5),
    endTime: rule.end_time.slice(0, 5),
    slotMinutes: rule.slot_minutes,
    bufferMinutes: rule.buffer_minutes,
    active: rule.active,
  };
}

function newRuleRow(): RuleRow {
  return {
    key: randomKey(),
    id: null,
    weekday: 1,
    startTime: "09:00",
    endTime: "12:00",
    slotMinutes: 30,
    bufferMinutes: 10,
    active: true,
  };
}

interface ExceptionRow {
  key: string;
  id: string | null;
  day: string;
  blocked: boolean;
  startTime: string;
  endTime: string;
  reason: string;
}

function exceptionToRow(exception: AvailabilityException): ExceptionRow {
  return {
    key: exception.id,
    id: exception.id,
    day: exception.day,
    blocked: exception.blocked,
    startTime: exception.start_time?.slice(0, 5) ?? "09:00",
    endTime: exception.end_time?.slice(0, 5) ?? "12:00",
    reason: exception.reason ?? "",
  };
}

function newExceptionRow(): ExceptionRow {
  return {
    key: randomKey(),
    id: null,
    day: new Date().toISOString().slice(0, 10),
    blocked: true,
    startTime: "09:00",
    endTime: "12:00",
    reason: "",
  };
}

export function AvailabilityEditor({ data }: { data: AvailabilityEditorData }) {
  const [rules, setRules] = React.useState<RuleRow[]>(() =>
    data.rules.map(ruleToRow)
  );
  const [exceptions, setExceptions] = React.useState<ExceptionRow[]>(() =>
    data.exceptions.map(exceptionToRow)
  );

  const previewSlots = React.useMemo(() => {
    const rulesForPreview: AvailabilityRule[] = rules
      .filter((row) => row.active)
      .map((row) => ({
        id: row.key,
        weekday: row.weekday,
        start_time: row.startTime,
        end_time: row.endTime,
        slot_minutes: row.slotMinutes,
        buffer_minutes: row.bufferMinutes,
        active: row.active,
      }));

    const exceptionsForPreview: AvailabilityException[] = exceptions.map(
      (row) => ({
        id: row.key,
        day: row.day,
        blocked: row.blocked,
        start_time: row.blocked ? null : row.startTime,
        end_time: row.blocked ? null : row.endTime,
        reason: row.reason || null,
      })
    );

    return computeAvailability({
      rules: rulesForPreview,
      exceptions: exceptionsForPreview,
      bookedRanges: data.bookedRanges,
      settings: data.settings,
    });
  }, [rules, exceptions, data.bookedRanges, data.settings]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-8">
        <RuleSection rules={rules} setRules={setRules} />
        <ExceptionSection
          exceptions={exceptions}
          setExceptions={setExceptions}
        />
      </div>
      <AvailabilityPreview slots={previewSlots} />
    </div>
  );
}

function RuleSection({
  rules,
  setRules,
}: {
  rules: RuleRow[];
  setRules: React.Dispatch<React.SetStateAction<RuleRow[]>>;
}) {
  function updateRow(key: string, patch: Partial<RuleRow>) {
    setRules((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function removeRow(key: string) {
    setRules((prev) => prev.filter((row) => row.key !== key));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-ink text-[16px] font-semibold">Wochenregeln</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRules((prev) => [...prev, newRuleRow()])}
        >
          <Plus className="size-4" aria-hidden="true" />
          Regel hinzufügen
        </Button>
      </div>

      {rules.length === 0 ? (
        <p className="text-ink-muted text-[14px]">Noch keine Wochenregeln.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((row) => (
            <RuleRowEditor
              key={row.key}
              row={row}
              onChange={(patch) => updateRow(row.key, patch)}
              onSaved={(id) => updateRow(row.key, { id })}
              onDeleted={() => removeRow(row.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RuleRowEditor({
  row,
  onChange,
  onSaved,
  onDeleted,
}: {
  row: RuleRow;
  onChange: (patch: Partial<RuleRow>) => void;
  onSaved: (id: string) => void;
  onDeleted: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isSaving, startSaving] = React.useTransition();
  const [isDeleting, startDeleting] = React.useTransition();

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const payload = {
        weekday: row.weekday,
        startTime: row.startTime,
        endTime: row.endTime,
        slotMinutes: row.slotMinutes,
        bufferMinutes: row.bufferMinutes,
        active: row.active,
      };

      if (row.id) {
        const result = await updateAvailabilityRule({ id: row.id, ...payload });
        if (!result.ok) {
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success("Wochenregel gespeichert");
        }
        return;
      }

      const result = await createAvailabilityRule(payload);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Wochenregel angelegt");
      onSaved(result.id);
    });
  }

  function handleDelete() {
    if (!row.id) {
      onDeleted();
      return;
    }
    setError(null);
    startDeleting(async () => {
      const result = await deleteAvailabilityRule({ id: row.id });
      if (result.ok) {
        setConfirmOpen(false);
        onDeleted();
        toast.success("Wochenregel gelöscht");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="border-line rounded-lg border p-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">Wochentag</span>
          <select
            value={row.weekday}
            onChange={(event) =>
              onChange({ weekday: Number(event.target.value) })
            }
            className="border-line bg-surface text-ink focus-visible:ring-accent h-10 w-[130px] rounded-lg border px-2 text-[14px] outline-none focus-visible:ring-2"
          >
            {WEEKDAY_LABELS.map((label, index) => (
              <option key={index} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">Von</span>
          <Input
            type="time"
            value={row.startTime}
            onChange={(event) => onChange({ startTime: event.target.value })}
            className="w-[110px]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">Bis</span>
          <Input
            type="time"
            value={row.endTime}
            onChange={(event) => onChange({ endTime: event.target.value })}
            className="w-[110px]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">Slotlänge (Min.)</span>
          <Input
            type="number"
            min={5}
            max={240}
            value={row.slotMinutes}
            onChange={(event) =>
              onChange({ slotMinutes: Number(event.target.value) })
            }
            className="w-[90px]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">Puffer (Min.)</span>
          <Input
            type="number"
            min={0}
            max={120}
            value={row.bufferMinutes}
            onChange={(event) =>
              onChange({ bufferMinutes: Number(event.target.value) })
            }
            className="w-[90px]"
          />
        </label>

        <Checkbox
          checked={row.active}
          onCheckedChange={(checked) => onChange({ active: checked })}
          label="Aktiv"
        />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="soft"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
          >
            Speichern
          </Button>

          <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
            <ModalTrigger
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label="Regel löschen"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ModalTrigger>
            <ModalContent
              title="Regel löschen?"
              footer={
                <>
                  <ModalClose
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Zurück
                  </ModalClose>
                  <Button
                    variant="primary"
                    onClick={handleDelete}
                    loading={isDeleting}
                  >
                    Ja, löschen
                  </Button>
                </>
              }
            >
              Diese Wochenregel wird entfernt. Das lässt sich nicht rückgängig
              machen.
            </ModalContent>
          </Modal>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-danger mt-2 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ExceptionSection({
  exceptions,
  setExceptions,
}: {
  exceptions: ExceptionRow[];
  setExceptions: React.Dispatch<React.SetStateAction<ExceptionRow[]>>;
}) {
  function updateRow(key: string, patch: Partial<ExceptionRow>) {
    setExceptions((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function removeRow(key: string) {
    setExceptions((prev) => prev.filter((row) => row.key !== key));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-ink text-[16px] font-semibold">Ausnahmen</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExceptions((prev) => [...prev, newExceptionRow()])}
        >
          <Plus className="size-4" aria-hidden="true" />
          Ausnahme hinzufügen
        </Button>
      </div>

      {exceptions.length === 0 ? (
        <p className="text-ink-muted text-[14px]">
          Keine Ausnahmen — z. B. für Urlaub oder Sondertermine.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {exceptions.map((row) => (
            <ExceptionRowEditor
              key={row.key}
              row={row}
              onChange={(patch) => updateRow(row.key, patch)}
              onSaved={(id) => updateRow(row.key, { id })}
              onDeleted={() => removeRow(row.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExceptionRowEditor({
  row,
  onChange,
  onSaved,
  onDeleted,
}: {
  row: ExceptionRow;
  onChange: (patch: Partial<ExceptionRow>) => void;
  onSaved: (id: string) => void;
  onDeleted: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isSaving, startSaving] = React.useTransition();
  const [isDeleting, startDeleting] = React.useTransition();

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const payload = {
        day: row.day,
        blocked: row.blocked,
        startTime: row.blocked ? null : row.startTime,
        endTime: row.blocked ? null : row.endTime,
        reason: row.reason.trim().length > 0 ? row.reason.trim() : null,
      };

      if (row.id) {
        const result = await updateAvailabilityException({
          id: row.id,
          ...payload,
        });
        if (!result.ok) {
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success("Ausnahme gespeichert");
        }
        return;
      }

      const result = await createAvailabilityException(payload);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Ausnahme angelegt");
      onSaved(result.id);
    });
  }

  function handleDelete() {
    if (!row.id) {
      onDeleted();
      return;
    }
    setError(null);
    startDeleting(async () => {
      const result = await deleteAvailabilityException({ id: row.id });
      if (result.ok) {
        setConfirmOpen(false);
        onDeleted();
        toast.success("Ausnahme gelöscht");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="border-line rounded-lg border p-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">Datum</span>
          <Input
            type="date"
            value={row.day}
            onChange={(event) => onChange({ day: event.target.value })}
            className="w-[150px]"
          />
        </label>

        <Checkbox
          checked={row.blocked}
          onCheckedChange={(checked) => onChange({ blocked: checked })}
          label="Ganzer Tag blockiert"
        />

        {!row.blocked ? (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px]">Von</span>
              <Input
                type="time"
                value={row.startTime}
                onChange={(event) =>
                  onChange({ startTime: event.target.value })
                }
                className="w-[110px]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px]">Bis</span>
              <Input
                type="time"
                value={row.endTime}
                onChange={(event) => onChange({ endTime: event.target.value })}
                className="w-[110px]"
              />
            </label>
          </>
        ) : null}

        <label className="flex min-w-[160px] flex-1 flex-col gap-1">
          <span className="text-ink-muted text-[12px]">Grund (optional)</span>
          <Input
            value={row.reason}
            onChange={(event) => onChange({ reason: event.target.value })}
            placeholder="z. B. Urlaub"
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="soft"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
          >
            Speichern
          </Button>

          <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
            <ModalTrigger
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label="Ausnahme löschen"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ModalTrigger>
            <ModalContent
              title="Ausnahme löschen?"
              footer={
                <>
                  <ModalClose
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Zurück
                  </ModalClose>
                  <Button
                    variant="primary"
                    onClick={handleDelete}
                    loading={isDeleting}
                  >
                    Ja, löschen
                  </Button>
                </>
              }
            >
              Diese Ausnahme wird entfernt. Das lässt sich nicht rückgängig
              machen.
            </ModalContent>
          </Modal>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-danger mt-2 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
