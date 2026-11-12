import type { FormulaCategory } from 'shared';

/** Visuels par categorie : photos maison pour moto/AAC, Unsplash pour le reste (licence Unsplash). */
export const FORMULA_IMAGE_BY_CATEGORY: Record<FormulaCategory, string> = {
  voiture:
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=60',
  conduite_accompagnee: '/images/acc-duo.webp',
  code: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=60',
  passerelle:
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=800&q=60',
  moto: '/images/moto-nuit.webp',
};
