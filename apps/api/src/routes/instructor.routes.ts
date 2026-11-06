import {
  avisFinStageSchema,
  createLessonSchema,
  updateAvailabilitySchema,
  updateLessonSchema,
} from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { validateBody } from '../middleware/validate.js';
import { Booking, type BookingDocument } from '../models/Booking.js';
import type { FormulaDocument } from '../models/Formula.js';
import { InstructorProfile } from '../models/InstructorProfile.js';
import { Lesson } from '../models/Lesson.js';
import { Session, type SessionDocument } from '../models/Session.js';
import { User } from '../models/User.js';
import {
  generateHoursSummaryPdf,
  getMonthlyHoursSummary,
} from '../services/instructorHours.service.js';
import { notifyAdminNotReady } from '../services/notification.service.js';

export const instructorRouter = Router();

// Middleware applique route par route (et non via un `router.use()` global) : ce routeur est
// monte sur le prefixe partage `/api/v1`, un `.use()` sans chemin interceptait toutes les
// requetes `/api/v1/*` (y compris les routes admin) avant qu'elles n'atteignent leur routeur.
const requireMoniteur = [requireAuth, requireRole('moniteur')] as const;

instructorRouter.get('/instructor/sessions', ...requireMoniteur, async (req, res, next) => {
  try {
    const sessions = await Session.find({ instructorId: req.user!.sub })
      .populate('formulaId', 'slug nom categorie boite')
      .populate('meetingPointId', 'nom adresse')
      .sort({ 'dates.0.jour': 1 });

    res.json({ data: sessions });
  } catch (err) {
    next(err);
  }
});

/** Verifie que la session appartient bien au moniteur connecte, sinon 404 (pas de fuite d'existence). */
async function findOwnSession(sessionId: string, instructorId: string): Promise<SessionDocument> {
  const session = await Session.findOne({ _id: sessionId, instructorId });

  if (!session) {
    throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session introuvable');
  }

  return session;
}

instructorRouter.get(
  '/instructor/sessions/:id/students',
  ...requireMoniteur,
  async (req, res, next) => {
    try {
      await findOwnSession(req.params.id!, req.user!.sub);

      const bookings = await Booking.find({
        sessionId: req.params.id,
        statut: { $in: ['confirmee', 'reportee', 'terminee'] },
      }).populate('studentId', 'prenom nom email telephone dateNaissance');

      res.json({ data: bookings });
    } catch (err) {
      next(err);
    }
  },
);

/** Verifie qu'une reservation appartient a une session du moniteur connecte. */
async function findOwnBooking(bookingId: string, instructorId: string): Promise<BookingDocument> {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Reservation introuvable');
  }

  const session = await Session.findOne({ _id: booking.sessionId, instructorId });

  if (!session) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Reservation introuvable');
  }

  return booking;
}

instructorRouter.get(
  '/instructor/bookings/:bookingId/lessons',
  ...requireMoniteur,
  async (req, res, next) => {
    try {
      await findOwnBooking(req.params.bookingId!, req.user!.sub);
      const lessons = await Lesson.find({ bookingId: req.params.bookingId }).sort({ date: -1 });
      res.json({ data: lessons });
    } catch (err) {
      next(err);
    }
  },
);

instructorRouter.post(
  '/instructor/bookings/:bookingId/lessons',
  ...requireMoniteur,
  validateBody(createLessonSchema),
  async (req, res, next) => {
    try {
      await findOwnBooking(req.params.bookingId!, req.user!.sub);

      const lesson = await Lesson.create({
        ...req.body,
        bookingId: req.params.bookingId,
        instructorId: req.user!.sub,
      });

      res.status(201).json({ data: lesson });
    } catch (err) {
      next(err);
    }
  },
);

instructorRouter.patch(
  '/instructor/lessons/:id',
  ...requireMoniteur,
  validateBody(updateLessonSchema),
  async (req, res, next) => {
    try {
      const lesson = await Lesson.findOne({ _id: req.params.id, instructorId: req.user!.sub });

      if (!lesson) {
        throw new ApiError(404, 'LESSON_NOT_FOUND', 'Lecon introuvable');
      }

      lesson.set(req.body);
      await lesson.save();
      res.json({ data: lesson });
    } catch (err) {
      next(err);
    }
  },
);

instructorRouter.post(
  '/instructor/bookings/:bookingId/avis',
  ...requireMoniteur,
  validateBody(avisFinStageSchema),
  async (req, res, next) => {
    try {
      const booking = await findOwnBooking(req.params.bookingId!, req.user!.sub);

      booking.avisFinStage = req.body.avis;
      booking.avisFinStageDate = new Date();
      await booking.save();

      if (req.body.avis === 'pas_pret') {
        const [student, admins, session] = await Promise.all([
          User.findById(booking.studentId),
          User.find({ role: 'admin' }).select('email'),
          Session.findById(booking.sessionId).populate<{ formulaId: FormulaDocument }>('formulaId'),
        ]);

        if (student && session) {
          await notifyAdminNotReady(
            admins.map((a) => a.email),
            `${student.prenom} ${student.nom}`,
            session.formulaId.nom,
          );
        }
      }

      res.json({ data: booking });
    } catch (err) {
      next(err);
    }
  },
);

instructorRouter.get('/instructor/availability', ...requireMoniteur, async (req, res, next) => {
  try {
    const profile = await InstructorProfile.findOne({ userId: req.user!.sub });

    if (!profile) {
      throw new ApiError(404, 'INSTRUCTOR_PROFILE_NOT_FOUND', 'Profil moniteur introuvable');
    }

    res.json({ data: profile.disponibilites });
  } catch (err) {
    next(err);
  }
});

instructorRouter.put(
  '/instructor/availability',
  ...requireMoniteur,
  validateBody(updateAvailabilitySchema),
  async (req, res, next) => {
    try {
      const profile = await InstructorProfile.findOneAndUpdate(
        { userId: req.user!.sub },
        { disponibilites: req.body.disponibilites },
        { new: true },
      );

      if (!profile) {
        throw new ApiError(404, 'INSTRUCTOR_PROFILE_NOT_FOUND', 'Profil moniteur introuvable');
      }

      res.json({ data: profile.disponibilites });
    } catch (err) {
      next(err);
    }
  },
);

function parseMonthParam(month: unknown): string {
  if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Parametre month attendu au format AAAA-MM');
  }

  return month;
}

instructorRouter.get('/instructor/hours-summary', ...requireMoniteur, async (req, res, next) => {
  try {
    const month = parseMonthParam(req.query.month);
    const summary = await getMonthlyHoursSummary(req.user!.sub, month);
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
});

instructorRouter.get(
  '/instructor/hours-summary/export.pdf',
  ...requireMoniteur,
  async (req, res, next) => {
    try {
      const month = parseMonthParam(req.query.month);
      const instructor = await User.findById(req.user!.sub);

      if (!instructor) {
        throw new ApiError(404, 'USER_NOT_FOUND', 'Utilisateur introuvable');
      }

      const summary = await getMonthlyHoursSummary(req.user!.sub, month);
      const pdf = await generateHoursSummaryPdf(instructor, summary);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="heures-${month}.pdf"`);
      res.send(pdf);
    } catch (err) {
      next(err);
    }
  },
);
