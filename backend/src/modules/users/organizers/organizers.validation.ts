import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  location: z.string().min(3).max(500),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Invalid date format",
  }),
  capacity: z.number().int().positive(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
