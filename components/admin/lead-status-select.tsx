"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadStatus } from "@/lib/actions/leads";
import { LEAD_STATUS_LABELS } from "@/lib/labels";
import type { LeadStatus } from "@/types/database";

const STATUS_OPTIONS: LeadStatus[] = [
  "neu",
  "kontaktiert",
  "termin_gebucht",
  "gespraech_gefuehrt",
  "kunde",
  "kein_interesse",
];

export function LeadStatusSelect({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const [value, setValue] = React.useState(status);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleChange(next: string | null) {
    if (!next || next === value) return;
    const previous = value;
    const nextStatus = next as LeadStatus;
    setValue(nextStatus);
    setError(null);

    startTransition(async () => {
      const result = await updateLeadStatus({ leadId, status: nextStatus });
      if (!result.ok) {
        setValue(previous);
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(`Status geändert zu „${LEAD_STATUS_LABELS[nextStatus]}“`);
      }
    });
  }

  return (
    <div>
      <Select value={value} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-full" aria-label="Status ändern">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {LEAD_STATUS_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p role="alert" className="text-danger mt-1.5 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
