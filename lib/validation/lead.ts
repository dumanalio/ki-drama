import { z } from "zod";

const LEAD_STATUS_VALUES = [
  "neu",
  "kontaktiert",
  "termin_gebucht",
  "gespraech_gefuehrt",
  "kunde",
  "kein_interesse",
] as const;

export const leadStatusUpdateSchema = z.object({
  leadId: z.uuid(),
  status: z.enum(LEAD_STATUS_VALUES),
});

export const leadNotesUpdateSchema = z.object({
  leadId: z.uuid(),
  notes: z.string().trim().max(10000),
});

export const leadActivityCreateSchema = z.object({
  leadId: z.uuid(),
  body: z.string().trim().min(1, "Die Notiz darf nicht leer sein.").max(4000),
});

export type LeadStatusUpdateInput = z.infer<typeof leadStatusUpdateSchema>;
export type LeadNotesUpdateInput = z.infer<typeof leadNotesUpdateSchema>;
export type LeadActivityCreateInput = z.infer<typeof leadActivityCreateSchema>;
