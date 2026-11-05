/** Statuts d'une session (occurrence datee d'une formule), voir CAHIER_DES_CHARGES.md section 9. */
export const SESSION_STATUSES = [
  'brouillon',
  'publiee',
  'complete',
  'terminee',
  'annulee',
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const GEARBOXES = ['manuelle', 'automatique'] as const;

export type Gearbox = (typeof GEARBOXES)[number];
