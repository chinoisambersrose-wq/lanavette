import type { ExamResultValue, FormulaCategory, Gearbox, Role, SessionStatus } from 'shared';

export interface Formula {
  _id: string;
  slug: string;
  nom: string;
  categorie: FormulaCategory;
  boite: Gearbox;
  heuresConduite?: number;
  dureeJours: number;
  prix: number;
  mensualiteAffichee?: number;
  pointsCles: string[];
  badge?: string;
  actif: boolean;
  ordre: number;
}

export interface City {
  _id: string;
  slug: string;
  nom: string;
  actif: boolean;
}

export interface MeetingPoint {
  _id: string;
  cityId: string;
  nom: string;
  adresse: string;
  location: { type: 'Point'; coordinates: [number, number] };
  boites: Gearbox[];
}

export interface ExamSlot {
  _id: string;
  cityId: string;
  date: string;
  centreExamen: string;
  placesTotal: number;
  placesAffectees: number;
}

export type Populated<T> = string | (T & { _id: string });

export interface SessionDay {
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface SessionAdmin {
  _id: string;
  formulaId: Populated<{ slug: string; nom: string }>;
  meetingPointId: Populated<{ nom: string }>;
  instructorId: Populated<{ prenom: string; nom: string }>;
  examSlotId?: string;
  dates: SessionDay[];
  placesTotal: number;
  placesRestantes: number;
  statut: SessionStatus;
}

export interface AdminUser {
  _id: string;
  email: string;
  prenom: string;
  nom: string;
  role: Role;
  actif: boolean;
}

export interface BookingAdmin {
  _id: string;
  studentId: Populated<{ prenom: string; nom: string; email: string }>;
  sessionId: Populated<{ formulaId: string; examSlotId?: string }>;
  statut: string;
  montantTotal: number;
}

export interface ExamResultAdmin {
  _id: string;
  bookingId: Populated<{
    studentId: Populated<{ prenom: string; nom: string }>;
    sessionId: Populated<{ formulaId: Populated<{ nom: string }> }>;
  }>;
  examSlotId: string;
  date: string;
  resultat: ExamResultValue;
}

export interface ExamResultStatsRow {
  key: string;
  label: string;
  admis: number;
  ajourne: number;
  absent: number;
  tauxReussite: number;
}

export interface PaymentAdmin {
  _id: string;
  bookingId: Populated<{
    studentId: Populated<{ prenom: string; nom: string }>;
    sessionId: Populated<{ formulaId: Populated<{ nom: string }> }>;
  }>;
  montant: number;
  statut: string;
  prestataire: string;
  numeroFacture?: string;
  createdAt: string;
}

export function populatedId(value: Populated<object>): string {
  return typeof value === 'string' ? value : value._id;
}

export function populatedLabel(
  value: Populated<{ nom?: string; prenom?: string; slug?: string }>,
): string {
  if (typeof value === 'string') return value;
  if (value.prenom) return `${value.prenom} ${value.nom ?? ''}`.trim();
  return value.nom ?? value.slug ?? value._id;
}
