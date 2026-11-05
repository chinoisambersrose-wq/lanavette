/** Categories de formule proposees en V1 (CAHIER_DES_CHARGES.md section 3). */
export const FORMULA_CATEGORIES = [
  'voiture',
  'conduite_accompagnee',
  'code',
  'passerelle',
  'moto',
] as const;

export type FormulaCategory = (typeof FORMULA_CATEGORIES)[number];

export const DOCUMENT_TYPES = [
  'piece_identite',
  'justificatif_domicile',
  'photo_ephoto',
  'assr',
  'autre',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_STATUSES = ['recu', 'valide', 'refuse'] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
