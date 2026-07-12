"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addLeadActivity } from "@/lib/actions/leads";

export function LeadAddNoteForm({ leadId }: { leadId: string }) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await addLeadActivity({ leadId, body: value });
      if (result.ok) {
        setValue("");
        toast.success("Notiz hinzugefügt");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border-line mt-6 border-t pt-6">
      <label
        htmlFor="new-note"
        className="text-ink mb-1.5 block text-[15px] font-medium"
      >
        Notiz hinzufügen
      </label>
      <Textarea
        id="new-note"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Was ist passiert?"
        className="min-h-[80px]"
        invalid={Boolean(error)}
      />
      {error ? (
        <p role="alert" className="text-danger mt-1.5 text-[13px]">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <Button
          type="submit"
          variant="outline"
          size="sm"
          loading={isPending}
          disabled={value.trim().length === 0}
        >
          Notiz hinzufügen
        </Button>
      </div>
    </form>
  );
}
