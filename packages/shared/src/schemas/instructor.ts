import { z } from 'zod';
import { AVIS_FIN_STAGE } from '../constants/booking.js';

const availabilityPeriodSchema = z.object({
  debut: z.coerce.date(),
  fin: z.coerce.date(),
});

export const updateAvailabilitySchema = z.object({
  disponibilites: z.array(availabilityPeriodSchema),
});

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;

export const avisFinStageSchema = z.object({
  avis: z.enum(AVIS_FIN_STAGE),
});

export type AvisFinStageInput = z.infer<typeof avisFinStageSchema>;
