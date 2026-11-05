/** Roles possibles pour un compte utilisateur (regle metier non negociable n°6 de CLAUDE.md). */
export const ROLES = ['eleve', 'moniteur', 'admin'] as const;

export type Role = (typeof ROLES)[number];
