import { z } from 'zod';

const sessionDaySchema = z.object({
  jour: z.coerce.date(),
  heureDebut: z.string().regex(/^\d{2}:\d{2}$/),
  heureFin: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createSessionSchema = z.object({
  formulaId: z.string().min(1),
  meetingPointId: z.string().min(1),
  instructorId: z.string().min(1),
  examSlotId: z.string().min(1).optional(),
  dates: z.array(sessionDaySchema).min(1),
  placesTotal: z.number().int().positive(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = createSessionSchema.partial();

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
