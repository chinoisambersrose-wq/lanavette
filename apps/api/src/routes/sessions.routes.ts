import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { City } from '../models/City.js';
import { Formula } from '../models/Formula.js';
import { MeetingPoint } from '../models/MeetingPoint.js';
import { Session } from '../models/Session.js';
import { Waitlist } from '../models/Waitlist.js';
import { isDuplicateKeyError } from '../utils/mongoErrors.js';

export const sessionsRouter = Router();

sessionsRouter.get('/sessions', async (req, res, next) => {
  try {
    const { formula, city, boite } = req.query as {
      formula?: string;
      city?: string;
      boite?: string;
    };

    const formulaFilter: Record<string, unknown> = { actif: true };
    if (formula) formulaFilter.slug = formula;
    if (boite) formulaFilter.boite = boite;

    const formulaIds = (
      formula || boite ? await Formula.find(formulaFilter).select('_id') : []
    ).map((f) => f._id);

    const sessionFilter: Record<string, unknown> = { statut: 'publiee' };
    if (formula || boite) sessionFilter.formulaId = { $in: formulaIds };

    if (city) {
      const cityDoc = await City.findOne({ slug: city, actif: true });
      const meetingPoints = cityDoc
        ? await MeetingPoint.find({ cityId: cityDoc._id }).select('_id')
        : [];
      sessionFilter.meetingPointId = { $in: meetingPoints.map((m) => m._id) };
    }

    const sessions = await Session.find(sessionFilter)
      .where('placesRestantes')
      .gt(0)
      .populate('formulaId', 'slug nom categorie boite prix mensualiteAffichee')
      .populate('meetingPointId', 'nom adresse')
      .populate('instructorId', 'prenom nom')
      .sort({ 'dates.0.jour': 1 });

    res.json({ data: sessions });
  } catch (err) {
    next(err);
  }
});

/** Inscription a la liste d'attente d'une session (regle metier n°5, prevenu a la liberation d'une place). */
sessionsRouter.post(
  '/sessions/:id/waitlist',
  requireAuth,
  requireRole('eleve'),
  async (req, res, next) => {
    try {
      const session = await Session.findById(req.params.id);

      if (!session) {
        throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session introuvable');
      }

      const entry = await Waitlist.create({ studentId: req.user!.sub, sessionId: session._id });
      res.status(201).json({ data: entry });
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        next(
          new ApiError(
            409,
            'ALREADY_WAITLISTED',
            "Vous etes deja inscrit sur la liste d'attente de cette session",
          ),
        );
        return;
      }
      next(err);
    }
  },
);
