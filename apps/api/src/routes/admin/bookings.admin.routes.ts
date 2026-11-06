import { forceBookingExceptionSchema, rescheduleBookingSchema } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { validateBody } from '../../middleware/validate.js';
import { Booking } from '../../models/Booking.js';
import { recordAuditLog } from '../../services/auditLog.service.js';
import { cancelBooking, rescheduleBooking } from '../../services/booking.service.js';

export const bookingsAdminRouter = Router();

bookingsAdminRouter.use(requireAuth, requireRole('admin'));

bookingsAdminRouter.get('/', async (_req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('studentId', 'prenom nom email')
      .populate('sessionId')
      .sort({ createdAt: -1 });
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

async function findBookingOrThrow(bookingId: string) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Reservation introuvable');
  }

  return booking;
}

bookingsAdminRouter.post(
  '/:id/force-cancel',
  validateBody(forceBookingExceptionSchema),
  async (req, res, next) => {
    try {
      const booking = await findBookingOrThrow(req.params.id!);
      const avant = booking.toObject();

      const updated = await cancelBooking(booking, { forcedBy: req.user!.sub });

      await recordAuditLog(req.user!.sub, 'booking.force_cancel', avant, {
        ...updated.toObject(),
        motif: req.body.motif,
      });

      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

bookingsAdminRouter.post(
  '/:id/force-reschedule',
  validateBody(rescheduleBookingSchema),
  async (req, res, next) => {
    try {
      const booking = await findBookingOrThrow(req.params.id!);
      const avant = booking.toObject();

      const updated = await rescheduleBooking(booking, req.body.newSessionId, {
        forcedBy: req.user!.sub,
      });

      await recordAuditLog(req.user!.sub, 'booking.force_reschedule', avant, updated.toObject());

      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);
