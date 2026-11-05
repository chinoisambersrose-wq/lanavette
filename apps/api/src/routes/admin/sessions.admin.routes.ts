import { createSessionSchema, updateSessionSchema } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { validateBody } from '../../middleware/validate.js';
import { Session } from '../../models/Session.js';
import { publishSession } from '../../services/session.service.js';

export const sessionsAdminRouter = Router();

sessionsAdminRouter.use(requireAuth, requireRole('admin'));

sessionsAdminRouter.get('/', async (_req, res, next) => {
  try {
    const sessions = await Session.find()
      .populate('formulaId', 'slug nom')
      .populate('meetingPointId', 'nom')
      .populate('instructorId', 'prenom nom')
      .sort({ createdAt: -1 });
    res.json({ data: sessions });
  } catch (err) {
    next(err);
  }
});

sessionsAdminRouter.post('/', validateBody(createSessionSchema), async (req, res, next) => {
  try {
    const session = await Session.create({
      ...req.body,
      placesRestantes: req.body.placesTotal,
      statut: 'brouillon',
    });
    res.status(201).json({ data: session });
  } catch (err) {
    next(err);
  }
});

sessionsAdminRouter.patch('/:id', validateBody(updateSessionSchema), async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session introuvable');
    }

    if (session.statut !== 'brouillon') {
      throw new ApiError(
        400,
        'SESSION_NOT_EDITABLE',
        'Seule une session en brouillon peut etre modifiee',
      );
    }

    session.set(req.body);

    if (req.body.placesTotal !== undefined) {
      session.placesRestantes = req.body.placesTotal;
    }

    await session.save();
    res.json({ data: session });
  } catch (err) {
    next(err);
  }
});

sessionsAdminRouter.post('/:id/duplicate', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session introuvable');
    }

    const duplicate = await Session.create({
      formulaId: session.formulaId,
      meetingPointId: session.meetingPointId,
      instructorId: session.instructorId,
      dates: session.dates,
      placesTotal: session.placesTotal,
      placesRestantes: session.placesTotal,
      statut: 'brouillon',
    });

    res.status(201).json({ data: duplicate });
  } catch (err) {
    next(err);
  }
});

sessionsAdminRouter.post('/:id/publish', async (req, res, next) => {
  try {
    const session = await publishSession(req.params.id);
    res.json({ data: session });
  } catch (err) {
    next(err);
  }
});

sessionsAdminRouter.post('/:id/cancel', async (req, res, next) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { statut: 'annulee' },
      { new: true },
    );

    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session introuvable');
    }

    res.json({ data: session });
  } catch (err) {
    next(err);
  }
});
