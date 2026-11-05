import { Router } from 'express';
import { City } from '../models/City.js';
import { Formula } from '../models/Formula.js';
import { MeetingPoint } from '../models/MeetingPoint.js';
import { Session } from '../models/Session.js';

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
