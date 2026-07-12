import { z } from "zod";

const BOOKING_STATUS_VALUES = [
  "gebucht",
  "abgesagt",
  "wahrgenommen",
  "nicht_erschienen",
] as const;

export const bookingStatusUpdateSchema = z.object({
  bookingId: z.uuid(),
  status: z.enum(BOOKING_STATUS_VALUES),
});

export const bookingCancelSchema = z.object({
  bookingId: z.uuid(),
});

export type BookingStatusUpdateInput = z.infer<
  typeof bookingStatusUpdateSchema
>;
export type BookingCancelInput = z.infer<typeof bookingCancelSchema>;
