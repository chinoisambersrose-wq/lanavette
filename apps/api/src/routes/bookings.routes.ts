import { cancelBookingSchema, createBookingSchema, rescheduleBookingSchema } from 'shared';
import { Router } from 'express';
import { env } from '../config/env.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { validateBody } from '../middleware/validate.js';
import { Booking } from '../models/Booking.js';
import { cancelBooking, createBooking, rescheduleBooking } from '../services/booking.service.js';
import { createCheckoutSession } from '../services/payment.service.js';

export const bookingsRouter = Router();

// Middleware applique route par route (et non via un `router.use()` global) : ce routeur est
// monte sur le prefixe partage `/api/v1`, un `.use()` sans chemin interceptait toutes les
// requetes `/api/v1/*` (y compris les routes admin) avant qu'elles n'atteignent leur routeur.
const requireEleve = [requireAuth, requireRole('eleve')] as const;

bookingsRouter.get('/me/bookings', ...requireEleve, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ studentId: req.user!.sub })
      .populate({
        path: 'sessionId',
        populate: [
          { path: 'formulaId' },
          { path: 'meetingPointId' },
          { path: 'instructorId', select: 'prenom nom' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

bookingsRouter.post(
  '/bookings',
  ...requireEleve,
  validateBody(createBookingSchema),
  async (req, res, next) => {
    try {
      const booking = await createBooking(req.user!.sub, req.body.sessionId);
      res.status(201).json({ data: booking });
    } catch (err) {
      next(err);
    }
  },
);

async function findOwnBooking(bookingId: string, studentId: string) {
  const booking = await Booking.findOne({ _id: bookingId, studentId });

  if (!booking) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Reservation introuvable');
  }

  return booking;
}

bookingsRouter.post('/bookings/:id/checkout', ...requireEleve, async (req, res, next) => {
  try {
    const bookingId = req.params.id!;
    const { modePaiement } = req.body as { modePaiement?: string };

    if (modePaiement === 'plusieurs_fois' && !env.ALMA_ENABLED) {
      throw new ApiError(
        400,
        'ALMA_DISABLED',
        "Le paiement en plusieurs fois n'est pas encore active sur cette instance",
      );
    }

    await findOwnBooking(bookingId, req.user!.sub);
    const checkoutSession = await createCheckoutSession(bookingId);
    res.json({ data: { checkoutUrl: checkoutSession.url } });
  } catch (err) {
    next(err);
  }
});

bookingsRouter.post(
  '/bookings/:id/reschedule',
  ...requireEleve,
  validateBody(rescheduleBookingSchema),
  async (req, res, next) => {
    try {
      const booking = await findOwnBooking(req.params.id!, req.user!.sub);
      const updated = await rescheduleBooking(booking, req.body.newSessionId);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

bookingsRouter.post(
  '/bookings/:id/cancel',
  ...requireEleve,
  validateBody(cancelBookingSchema),
  async (req, res, next) => {
    try {
      const booking = await findOwnBooking(req.params.id!, req.user!.sub);
      const updated = await cancelBooking(booking);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);
