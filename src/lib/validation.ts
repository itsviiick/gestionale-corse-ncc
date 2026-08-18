import { z } from "zod";

export const rideInputSchema = z.object({
  pickupDateTime: z.string().min(1, "Data e ora obbligatorie"),
  pickupLocation: z.string().min(1, "Luogo di ritiro obbligatorio"),
  dropoffLocation: z.string().optional().nullable(),
  clientName: z.string().min(1, "Nome cliente obbligatorio"),
  clientPhone: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  passengerCount: z.coerce.number().int().positive().optional().nullable(),
  flightNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  rawText: z.string().optional(),
  source: z.enum(["MANUAL_PASTE", "MANUAL_ENTRY", "OTHER"]).optional(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});

export type RideInput = z.infer<typeof rideInputSchema>;
