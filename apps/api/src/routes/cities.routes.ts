import { Router } from 'express';
import { ApiError } from '../middleware/errorHandler.js';
import { City } from '../models/City.js';
import { MeetingPoint } from '../models/MeetingPoint.js';

export const citiesRouter = Router();

citiesRouter.get('/cities', async (_req, res, next) => {
  try {
    const cities = await City.find({ actif: true }).sort({ nom: 1 });
    res.json({ data: cities });
  } catch (err) {
    next(err);
  }
});

citiesRouter.get('/cities/:slug/meeting-points', async (req, res, next) => {
  try {
    const city = await City.findOne({ slug: req.params.slug, actif: true });

    if (!city) {
      throw new ApiError(404, 'CITY_NOT_FOUND', 'Ville introuvable');
    }

    const meetingPoints = await MeetingPoint.find({ cityId: city._id });
    res.json({ data: meetingPoints });
  } catch (err) {
    next(err);
  }
});
