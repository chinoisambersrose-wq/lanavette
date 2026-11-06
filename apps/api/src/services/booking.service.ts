import type { Types } from 'mongoose';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';
import { Booking, type BookingDocument } from '../models/Booking.js';
import { Formula } from '../models/Formula.js';
import { Session, type SessionDocument } from '../models/Session.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Cree une reservation en bloquant une place de facon atomique (regle metier n°1).
 * La place reste bloquee `BOOKING_HOLD_DURATION_MINUTES` minutes (regle metier n°2).
 */
export async function createBooking(
  studentId: Types.ObjectId | string,
  sessionId: Types.ObjectId | string,
): Promise<BookingDocument> {
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, statut: 'publiee', placesRestantes: { $gt: 0 } },
    { $inc: { placesRestantes: -1 } },
    { new: true },
  );

  if (!session) {
    throw new ApiError(
      409,
      'SESSION_FULL',
      'Cette session est complete ou indisponible, aucune place restante',
    );
  }

  const formula = await Formula.findById(session.formulaId);

  if (!formula) {
    await releaseSessionPlace(session._id);
    throw new ApiError(404, 'FORMULA_NOT_FOUND', 'Formule introuvable pour cette session');
  }

  const expireAt = new Date(Date.now() + env.BOOKING_HOLD_DURATION_MINUTES * 60 * 1000);

  return Booking.create({
    studentId,
    sessionId: session._id,
    statut: 'en_attente_paiement',
    montantTotal: formula.prix,
    source: 'site',
    expireAt,
  });
}

/** Rend la place a la session de facon atomique, quelle que soit la raison. */
async function releaseSessionPlace(sessionId: Types.ObjectId | string): Promise<void> {
  await Session.findOneAndUpdate({ _id: sessionId }, { $inc: { placesRestantes: 1 } });
}

/** true si l'annulation/le report est dans la fenetre gratuite (CGV, regle configurable). */
export function isWithinFreeCancellationWindow(session: SessionDocument): boolean {
  const firstDay = session.dates[0]?.jour;
  if (!firstDay) return false;

  const thresholdMs = env.CANCELLATION_FREE_DAYS_BEFORE_START * ONE_DAY_MS;
  return new Date(firstDay).getTime() - Date.now() >= thresholdMs;
}

export interface CancelOptions {
  forcedBy?: Types.ObjectId | string;
}

/**
 * Annule une reservation. Hors delai gratuit, seul un admin peut forcer l'exception
 * (tracee dans auditLogs par l'appelant, voir routes/bookings.routes.ts).
 */
export async function cancelBooking(
  booking: BookingDocument,
  options: CancelOptions = {},
): Promise<BookingDocument> {
  if (booking.statut === 'annulee' || booking.statut === 'terminee') {
    throw new ApiError(
      400,
      'BOOKING_NOT_CANCELLABLE',
      'Cette reservation ne peut plus etre annulee',
    );
  }

  if (!options.forcedBy) {
    const session = await Session.findById(booking.sessionId);
    if (!session || !isWithinFreeCancellationWindow(session)) {
      throw new ApiError(
        400,
        'CANCELLATION_WINDOW_PASSED',
        `Le delai d'annulation gratuite (${env.CANCELLATION_FREE_DAYS_BEFORE_START} jours avant le debut) est depasse. Contactez l'equipe.`,
      );
    }
  }

  await releaseSessionPlace(booking.sessionId);
  booking.statut = 'annulee';
  await booking.save();

  return booking;
}

export interface RescheduleOptions {
  forcedBy?: Types.ObjectId | string;
}

/** Reporte une reservation vers une nouvelle session, en reservant une place avant de liberer l'ancienne. */
export async function rescheduleBooking(
  booking: BookingDocument,
  newSessionId: Types.ObjectId | string,
  options: RescheduleOptions = {},
): Promise<BookingDocument> {
  if (booking.statut !== 'confirmee') {
    throw new ApiError(
      400,
      'BOOKING_NOT_RESCHEDULABLE',
      'Seule une reservation confirmee peut etre reportee',
    );
  }

  if (!options.forcedBy) {
    const currentSession = await Session.findById(booking.sessionId);
    if (!currentSession || !isWithinFreeCancellationWindow(currentSession)) {
      throw new ApiError(
        400,
        'CANCELLATION_WINDOW_PASSED',
        `Le delai de report gratuit (${env.CANCELLATION_FREE_DAYS_BEFORE_START} jours avant le debut) est depasse. Contactez l'equipe.`,
      );
    }
  }

  const newSession = await Session.findOneAndUpdate(
    { _id: newSessionId, statut: 'publiee', placesRestantes: { $gt: 0 } },
    { $inc: { placesRestantes: -1 } },
    { new: true },
  );

  if (!newSession) {
    throw new ApiError(409, 'SESSION_FULL', 'La nouvelle session est complete ou indisponible');
  }

  await releaseSessionPlace(booking.sessionId);

  booking.sessionId = newSession._id;
  booking.statut = 'confirmee';
  await booking.save();

  return booking;
}

/**
 * Libere les places des reservations `en_attente_paiement` dont le delai a expire
 * (regle metier n°2). Appelee par la tache planifiee.
 */
export async function expireStaleBookings(now: Date = new Date()): Promise<number> {
  const candidates = await Booking.find({
    statut: 'en_attente_paiement',
    expireAt: { $lte: now },
  }).select('_id sessionId');

  let expiredCount = 0;

  for (const candidate of candidates) {
    // Transition atomique : si le webhook a confirme la reservation entre les deux requetes,
    // le statut n'est plus `en_attente_paiement` et cette mise a jour ne fait rien.
    const expired = await Booking.findOneAndUpdate(
      { _id: candidate._id, statut: 'en_attente_paiement' },
      { statut: 'annulee' },
    );

    if (expired) {
      await releaseSessionPlace(expired.sessionId);
      expiredCount += 1;
    }
  }

  return expiredCount;
}
