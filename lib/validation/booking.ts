import { z } from "zod";

export const bookingCreateSchema = z.object({
  sessionId: z.string().min(1),
  startsAt: z.iso.datetime({ message: "Ungültiger Zeitpunkt." }),
  message: z.string().trim().max(2000).optional(),
});

export const bookingRescheduleSchema = z.object({
  startsAt: z.iso.datetime({ message: "Ungültiger Zeitpunkt." }),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingRescheduleInput = z.infer<typeof bookingRescheduleSchema>;
