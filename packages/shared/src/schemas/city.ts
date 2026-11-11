import { z } from 'zod';
import { GEARBOXES } from '../constants/session.js';

export const createCitySchema = z.object({
  slug: z.string().min(1),
  nom: z.string().min(1),
  actif: z.boolean().default(false),
});

export type CreateCityInput = z.input<typeof createCitySchema>;

export const createMeetingPointSchema = z.object({
  nom: z.string().min(1),
  adresse: z.string().min(1),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  boites: z.array(z.enum(GEARBOXES)).default(['manuelle', 'automatique']),
  cityId: z.string().min(1),
});

export type CreateMeetingPointInput = z.input<typeof createMeetingPointSchema>;

export const updateCitySchema = createCitySchema.partial();

export type UpdateCityInput = z.input<typeof updateCitySchema>;

export const updateMeetingPointSchema = createMeetingPointSchema.partial();

export type UpdateMeetingPointInput = z.input<typeof updateMeetingPointSchema>;
