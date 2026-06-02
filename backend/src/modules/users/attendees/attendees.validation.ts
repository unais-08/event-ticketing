import { z } from "zod";

export const purchaseTicketSchema = z.object({
  eventId: z.string().uuid(),
});

export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
