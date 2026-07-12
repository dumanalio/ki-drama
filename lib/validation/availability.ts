import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const ruleFieldsSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(TIME_PATTERN, "Ungültige Uhrzeit."),
  endTime: z.string().regex(TIME_PATTERN, "Ungültige Uhrzeit."),
  slotMinutes: z.number().int().min(5).max(240),
  bufferMinutes: z.number().int().min(0).max(120),
  active: z.boolean(),
});

function afterStart(data: { startTime: string; endTime: string }) {
  return data.endTime > data.startTime;
}

export const availabilityRuleCreateSchema = ruleFieldsSchema.refine(
  afterStart,
  { message: "Das Ende muss nach dem Start liegen.", path: ["endTime"] }
);

export const availabilityRuleUpdateSchema = ruleFieldsSchema
  .extend({ id: z.uuid() })
  .refine(afterStart, {
    message: "Das Ende muss nach dem Start liegen.",
    path: ["endTime"],
  });

export const availabilityRuleDeleteSchema = z.object({ id: z.uuid() });

const exceptionFieldsSchema = z.object({
  day: z.iso.date({ message: "Ungültiges Datum." }),
  blocked: z.boolean(),
  startTime: z.string().regex(TIME_PATTERN).nullable(),
  endTime: z.string().regex(TIME_PATTERN).nullable(),
  reason: z.string().trim().max(200).nullable(),
});

function hasWindowWhenNotBlocked(data: {
  blocked: boolean;
  startTime: string | null;
  endTime: string | null;
}) {
  return (
    data.blocked ||
    (data.startTime !== null &&
      data.endTime !== null &&
      data.endTime > data.startTime)
  );
}

export const availabilityExceptionCreateSchema = exceptionFieldsSchema.refine(
  hasWindowWhenNotBlocked,
  {
    message: "Für ein Extra-Fenster braucht es Start- und Endzeit.",
    path: ["endTime"],
  }
);

export const availabilityExceptionUpdateSchema = exceptionFieldsSchema
  .extend({ id: z.uuid() })
  .refine(hasWindowWhenNotBlocked, {
    message: "Für ein Extra-Fenster braucht es Start- und Endzeit.",
    path: ["endTime"],
  });

export const availabilityExceptionDeleteSchema = z.object({ id: z.uuid() });

export type AvailabilityRuleCreateInput = z.infer<
  typeof availabilityRuleCreateSchema
>;
export type AvailabilityRuleUpdateInput = z.infer<
  typeof availabilityRuleUpdateSchema
>;
export type AvailabilityExceptionCreateInput = z.infer<
  typeof availabilityExceptionCreateSchema
>;
export type AvailabilityExceptionUpdateInput = z.infer<
  typeof availabilityExceptionUpdateSchema
>;
