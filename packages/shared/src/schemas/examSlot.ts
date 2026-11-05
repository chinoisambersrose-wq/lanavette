import { z } from 'zod';

export const createExamSlotSchema = z.object({
  date: z.coerce.date(),
  centreExamen: z.string().min(1),
  placesTotal: z.number().int().positive(),
  cityId: z.string().min(1),
});

export type CreateExamSlotInput = z.infer<typeof createExamSlotSchema>;

export const updateExamSlotSchema = createExamSlotSchema.partial();

export type UpdateExamSlotInput = z.infer<typeof updateExamSlotSchema>;
