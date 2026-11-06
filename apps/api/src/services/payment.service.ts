import type Stripe from 'stripe';
import { getStripeClient } from '../config/stripe.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../middleware/errorHandler.js';
import { Booking, type BookingDocument } from '../models/Booking.js';
import type { FormulaDocument } from '../models/Formula.js';
import { Payment } from '../models/Payment.js';
import type { SessionDocument } from '../models/Session.js';
import { User, type UserDocument } from '../models/User.js';
import { isDuplicateKeyError } from '../utils/mongoErrors.js';
import { assignInvoiceNumber } from './invoice.service.js';
import { notifyBookingConfirmed } from './notification.service.js';

/** Cree une session Stripe Checkout pour une reservation en attente de paiement. */
export async function createCheckoutSession(bookingId: string): Promise<Stripe.Checkout.Session> {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Reservation introuvable');
  }

  if (booking.statut !== 'en_attente_paiement') {
    throw new ApiError(
      400,
      'BOOKING_NOT_PAYABLE',
      "Cette reservation n'est plus en attente de paiement",
    );
  }

  const stripe = getStripeClient();

  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: booking.montantTotal,
          product_data: { name: `Reservation ${booking._id.toString()}` },
        },
      },
    ],
    client_reference_id: booking._id.toString(),
    metadata: { bookingId: booking._id.toString() },
    success_url: `${env.STRIPE_SUCCESS_URL}?booking=${booking._id.toString()}`,
    cancel_url: `${env.STRIPE_CANCEL_URL}?booking=${booking._id.toString()}`,
  });
}

/**
 * Traite un evenement Stripe deja verifie (signature controlee par l'appelant).
 * Idempotent : un `referencePrestataire` (session.id) deja enregistre ne cree pas de doublon
 * (index unique sur payments.referencePrestataire) et ne fait jamais regresser le statut
 * d'une reservation deja confirmee (regle metier n°4 : confirmation uniquement par webhook).
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  if (event.type !== 'checkout.session.completed') {
    logger.debug({ type: event.type }, 'Evenement Stripe ignore (non gere)');
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.bookingId ?? session.client_reference_id;

  if (!bookingId) {
    logger.warn({ eventId: event.id }, 'Webhook Stripe sans bookingId associe');
    return;
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    logger.warn({ bookingId }, 'Webhook Stripe pour une reservation introuvable');
    return;
  }

  let payment;

  try {
    payment = await Payment.create({
      bookingId: booking._id,
      montant: booking.montantTotal,
      statut: 'paye',
      prestataire: 'stripe',
      referencePrestataire: session.id,
      payeLe: new Date(),
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      logger.info({ sessionId: session.id }, 'Webhook Stripe deja traite (idempotence)');
      return;
    }
    throw err;
  }

  await assignInvoiceNumber(payment);

  if (booking.statut === 'en_attente_paiement') {
    booking.statut = 'confirmee';
    booking.modePaiement = 'comptant';
    booking.expireAt = undefined;
    await booking.save();
    await notifyBookingConfirmationEmails(booking);
  }
}

/** Notifie l'eleve et le moniteur apres confirmation (evenement "reservation confirmee", section 13). */
async function notifyBookingConfirmationEmails(booking: BookingDocument): Promise<void> {
  const [student, populatedBooking] = await Promise.all([
    User.findById(booking.studentId),
    Booking.findById(booking._id).populate<{
      sessionId: SessionDocument & { formulaId: FormulaDocument; instructorId: UserDocument };
    }>({
      path: 'sessionId',
      populate: ['formulaId', 'instructorId'],
    }),
  ]);

  if (!student || !populatedBooking) return;

  const { formulaId: formula, instructorId: instructor } = populatedBooking.sessionId;

  await notifyBookingConfirmed({
    studentEmail: student.email,
    studentTelephone: student.telephone,
    studentName: `${student.prenom} ${student.nom}`,
    formulaName: formula.nom,
    instructorEmail: instructor.email,
    instructorName: `${instructor.prenom} ${instructor.nom}`,
  });
}
