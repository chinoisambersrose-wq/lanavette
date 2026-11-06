import type { AvisFinStage, LessonPresenceStatus } from 'shared';
import type { Populated, SessionDay } from './admin.js';

export interface InstructorSession {
  _id: string;
  formulaId: Populated<{ slug: string; nom: string; categorie: string; boite: string }>;
  meetingPointId: Populated<{ nom: string; adresse: string }>;
  dates: SessionDay[];
  placesTotal: number;
  placesRestantes: number;
  statut: string;
}

export interface InstructorStudent {
  _id: string;
  studentId: Populated<{
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    dateNaissance?: string;
  }>;
  statut: string;
  avisFinStage?: AvisFinStage;
  avisFinStageDate?: string;
}

export interface Lesson {
  _id: string;
  bookingId: string;
  instructorId: string;
  date: string;
  heures: number;
  competences: string[];
  commentaire?: string;
  presence: LessonPresenceStatus;
}

export interface AvailabilityPeriod {
  debut: string;
  fin: string;
}

export interface HoursSummary {
  month: string;
  totalHeures: number;
  nombreLecons: number;
}
