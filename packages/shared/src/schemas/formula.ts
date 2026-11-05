import { z } from 'zod';
import { FORMULA_CATEGORIES } from '../constants/formula.js';
import { GEARBOXES } from '../constants/session.js';

export const createFormulaSchema = z.object({
  slug: z.string().min(1),
  nom: z.string().min(1),
  categorie: z.enum(FORMULA_CATEGORIES),
  boite: z.enum(GEARBOXES),
  heuresConduite: z.number().int().nonnegative().optional(),
  dureeJours: z.number().int().positive(),
  prix: z.number().int().nonnegative(),
  mensualiteAffichee: z.number().int().nonnegative().optional(),
  pointsCles: z.array(z.string()).default([]),
  badge: z.string().optional(),
  actif: z.boolean().default(true),
  ordre: z.number().int().default(0),
});

/** z.input (pas z.infer) : les champs avec valeur par defaut (actif, ordre, pointsCles)
 * restent optionnels pour l'appelant, le serveur applique le defaut au parsing. */
export type CreateFormulaInput = z.input<typeof createFormulaSchema>;

export const updateFormulaSchema = createFormulaSchema.partial();

export type UpdateFormulaInput = z.input<typeof updateFormulaSchema>;
