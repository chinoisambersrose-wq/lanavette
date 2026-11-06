import type { Populated } from './admin.js';

export interface PublicSession {
  _id: string;
  formulaId: Populated<{
    slug: string;
    nom: string;
    categorie: string;
    boite: string;
    prix: number;
    mensualiteAffichee?: number;
  }>;
  meetingPointId: Populated<{ nom: string; adresse: string }>;
  instructorId: Populated<{ prenom: string; nom: string }>;
  placesRestantes: number;
  dates: Array<{ jour: string; heureDebut: string; heureFin: string }>;
}
