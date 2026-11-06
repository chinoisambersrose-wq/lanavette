import type { Types } from 'mongoose';
import { ApiError } from '../middleware/errorHandler.js';
import { Booking } from '../models/Booking.js';
import type { CityDocument } from '../models/City.js';
import { ExamResult, type ExamResultDocument } from '../models/ExamResult.js';
import type { FormulaDocument } from '../models/Formula.js';
import type { MeetingPointDocument } from '../models/MeetingPoint.js';
import type { SessionDocument } from '../models/Session.js';
import type { UserDocument } from '../models/User.js';
import { User } from '../models/User.js';
import { notifyExamResult } from './notification.service.js';

export interface CreateExamResultInput {
  bookingId: Types.ObjectId | string;
  examSlotId: Types.ObjectId | string;
  date: Date;
  resultat: ExamResultDocument['resultat'];
}

/** Saisit un resultat d'examen, cloture la reservation et notifie l'eleve (section 7/13). */
export async function createExamResult(input: CreateExamResultInput): Promise<ExamResultDocument> {
  const booking = await Booking.findById(input.bookingId);

  if (!booking) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Reservation introuvable');
  }

  const examResult = await ExamResult.create(input);

  booking.statut = 'terminee';
  await booking.save();

  const student = await User.findById(booking.studentId);
  if (student) {
    await notifyExamResult(student.email, `${student.prenom} ${student.nom}`, input.resultat);
  }

  return examResult;
}

export interface ExamResultStatsRow {
  key: string;
  label: string;
  admis: number;
  ajourne: number;
  absent: number;
  tauxReussite: number;
}

type GroupBy = 'formula' | 'city' | 'instructor';

type PopulatedSession = SessionDocument & {
  formulaId: FormulaDocument;
  instructorId: UserDocument;
  meetingPointId: MeetingPointDocument & { cityId: CityDocument };
};

/** Statistiques de reussite par formule, ville ou moniteur (back-office, section 8). */
export async function getExamResultStats(groupBy: GroupBy): Promise<ExamResultStatsRow[]> {
  const results = await ExamResult.find().populate<{
    bookingId: { sessionId: PopulatedSession };
  }>({
    path: 'bookingId',
    populate: {
      path: 'sessionId',
      populate: ['formulaId', 'instructorId', { path: 'meetingPointId', populate: 'cityId' }],
    },
  });

  const groups = new Map<
    string,
    { label: string; admis: number; ajourne: number; absent: number }
  >();

  for (const result of results) {
    const session = result.bookingId?.sessionId;
    if (!session) continue;

    let key: string;
    let label: string;

    if (groupBy === 'formula') {
      key = session.formulaId._id.toString();
      label = session.formulaId.nom;
    } else if (groupBy === 'instructor') {
      key = session.instructorId._id.toString();
      label = `${session.instructorId.prenom} ${session.instructorId.nom}`;
    } else {
      key = session.meetingPointId.cityId._id.toString();
      label = session.meetingPointId.cityId.nom;
    }

    const group = groups.get(key) ?? { label, admis: 0, ajourne: 0, absent: 0 };
    group[result.resultat] += 1;
    groups.set(key, group);
  }

  return Array.from(groups.entries()).map(([key, group]) => {
    const total = group.admis + group.ajourne;
    return {
      key,
      label: group.label,
      admis: group.admis,
      ajourne: group.ajourne,
      absent: group.absent,
      tauxReussite: total > 0 ? Math.round((group.admis / total) * 100) : 0,
    };
  });
}
