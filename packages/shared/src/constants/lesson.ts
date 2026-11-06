/** Statut de presence a une lecon, saisi par le moniteur (CAHIER_DES_CHARGES.md section 7). */
export const LESSON_PRESENCE_STATUSES = ['presente', 'absente', 'retard'] as const;

export type LessonPresenceStatus = (typeof LESSON_PRESENCE_STATUSES)[number];
