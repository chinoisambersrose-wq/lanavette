import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { Booking } from '../models/Booking.js';
import type { FormulaDocument } from '../models/Formula.js';
import { Payment } from '../models/Payment.js';
import type { SessionDocument } from '../models/Session.js';
import { User } from '../models/User.js';
import { generateInvoicePdf } from '../services/invoice.service.js';

export const paymentsRouter = Router();

const requireEleve = [requireAuth, requireRole('eleve')] as const;

async function findOwnBookingIds(studentId: string): Promise<string[]> {
  const bookings = await Booking.find({ studentId }).select('_id');
  return bookings.map((b) => b._id.toString());
}

paymentsRouter.get('/me/payments', ...requireEleve, async (req, res, next) => {
  try {
    const bookingIds = await findOwnBookingIds(req.user!.sub);
    const payments = await Payment.find({ bookingId: { $in: bookingIds } }).sort({
      createdAt: -1,
    });
    res.json({ data: payments });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/me/payments/:id/invoice', ...requireEleve, async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id!);

    if (!payment) {
      throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'Paiement introuvable');
    }

    const booking = await Booking.findOne({
      _id: payment.bookingId,
      studentId: req.user!.sub,
    }).populate<{ sessionId: SessionDocument & { formulaId: FormulaDocument } }>({
      path: 'sessionId',
      populate: { path: 'formulaId' },
    });

    if (!booking) {
      throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'Paiement introuvable');
    }

    const student = await User.findById(req.user!.sub);

    if (!student) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'Utilisateur introuvable');
    }

    const formula = booking.sessionId.formulaId;

    const pdf = await generateInvoicePdf({ payment, student, formula });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${payment.numeroFacture ?? payment._id.toString()}.pdf"`,
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});
