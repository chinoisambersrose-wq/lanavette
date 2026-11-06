import { z } from 'zod';
import { LESSON_PRESENCE_STATUSES } from '../constants/lesson.js';

export const createLessonSchema = z.object({
  date: z.coerce.date(),
  heures: z.number().positive(),
  competences: z.array(z.string()).default([]),
  commentaire: z.string().optional(),
  presence: z.enum(LESSON_PRESENCE_STATUSES).default('presente'),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = createLessonSchema.partial();

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
