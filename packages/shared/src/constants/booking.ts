/** Cycle de vie d'une reservation, voir docs/CAHIER_DES_CHARGES.md section 10. */
export const BOOKING_STATUSES = [
  'en_attente_paiement',
  'confirmee',
  'reportee',
  'annulee',
  'terminee',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_METHODS = ['comptant', 'plusieurs_fois', 'cpf', 'virement', 'agence'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const BOOKING_SOURCES = ['site', 'cpf', 'agence'] as const;

export type BookingSource = (typeof BOOKING_SOURCES)[number];

/** Duree en minutes avant expiration d'une reservation non payee (regle metier n°2). */
export const BOOKING_HOLD_DURATION_MINUTES = 15;
