import { z } from 'zod';
import { EXAM_RESULTS } from '../constants/examResult.js';

export const createExamResultSchema = z.object({
  bookingId: z.string().min(1),
  examSlotId: z.string().min(1),
  date: z.coerce.date(),
  resultat: z.enum(EXAM_RESULTS),
});

export type CreateExamResultInput = z.infer<typeof createExamResultSchema>;
