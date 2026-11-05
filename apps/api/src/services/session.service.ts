import type { Types } from 'mongoose';
import { ApiError } from '../middleware/errorHandler.js';
import { ExamSlot } from '../models/ExamSlot.js';
import { Session, type SessionDocument } from '../models/Session.js';

/**
 * Publie une session seulement si son examSlot a assez de places libres (regle metier n°3).
 * L'allocation des places d'examen est atomique pour eviter qu'une session surconsomme
 * les places disponibles en cas de publications concurrentes.
 */
export async function publishSession(sessionId: Types.ObjectId | string): Promise<SessionDocument> {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session introuvable');
  }

  if (!session.examSlotId) {
    throw new ApiError(
      400,
      'EXAM_SLOT_REQUIRED',
      "Impossible de publier une session sans creneau d'examen rattache",
    );
  }

  const updatedSlot = await ExamSlot.findOneAndUpdate(
    {
      _id: session.examSlotId,
      $expr: {
        $gte: [{ $subtract: ['$placesTotal', '$placesAffectees'] }, session.placesTotal],
      },
    },
    { $inc: { placesAffectees: session.placesTotal } },
    { new: true },
  );

  if (!updatedSlot) {
    throw new ApiError(
      400,
      'INSUFFICIENT_EXAM_SLOTS',
      "Le creneau d'examen rattache n'a pas assez de places libres pour cette session",
    );
  }

  session.statut = 'publiee';
  await session.save();

  return session;
}
