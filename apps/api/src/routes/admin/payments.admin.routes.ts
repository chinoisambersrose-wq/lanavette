import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import type { BookingDocument } from '../../models/Booking.js';
import type { FormulaDocument } from '../../models/Formula.js';
import { Payment } from '../../models/Payment.js';
import type { SessionDocument } from '../../models/Session.js';
import type { UserDocument } from '../../models/User.js';

export const paymentsAdminRouter = Router();

paymentsAdminRouter.use(requireAuth, requireRole('admin'));

type PopulatedPayment = Awaited<ReturnType<typeof findPopulatedPayments>>[number];

function findPopulatedPayments() {
  return Payment.find()
    .populate<{
      bookingId: BookingDocument & {
        studentId: UserDocument;
        sessionId: SessionDocument & { formulaId: FormulaDocument };
      };
    }>({
      path: 'bookingId',
      populate: ['studentId', { path: 'sessionId', populate: 'formulaId' }],
    })
    .sort({ createdAt: -1 });
}

paymentsAdminRouter.get('/', async (_req, res, next) => {
  try {
    const payments = await findPopulatedPayments();
    res.json({ data: payments });
  } catch (err) {
    next(err);
  }
});

/** Echappe une valeur pour une cellule CSV (RFC 4180 : guillemets doubles si virgule/guillemet/retour ligne). */
function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(payment: PopulatedPayment): string {
  const booking = payment.bookingId;
  const student = booking?.studentId;
  const formula = booking?.sessionId?.formulaId;

  return [
    payment.createdAt.toISOString(),
    student ? `${student.prenom} ${student.nom}` : '',
    formula?.nom ?? '',
    (payment.montant / 100).toFixed(2),
    payment.statut,
    payment.prestataire,
    payment.numeroFacture ?? '',
  ]
    .map((value) => csvCell(String(value)))
    .join(',');
}

paymentsAdminRouter.get('/export.csv', async (_req, res, next) => {
  try {
    const payments = await findPopulatedPayments();
    const header = 'date,eleve,formule,montant_eur,statut,prestataire,numero_facture';
    const csv = [header, ...payments.map(toCsvRow)].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="paiements.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});
