import {
  createCitySchema,
  createMeetingPointSchema,
  updateCitySchema,
  updateMeetingPointSchema,
} from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { validateBody } from '../../middleware/validate.js';
import { City } from '../../models/City.js';
import { MeetingPoint } from '../../models/MeetingPoint.js';

export const citiesAdminRouter = Router();

const createMeetingPointBodySchema = createMeetingPointSchema.omit({ cityId: true });

citiesAdminRouter.use(requireAuth, requireRole('admin'));

citiesAdminRouter.get('/', async (_req, res, next) => {
  try {
    const cities = await City.find().sort({ nom: 1 });
    res.json({ data: cities });
  } catch (err) {
    next(err);
  }
});

citiesAdminRouter.post('/', validateBody(createCitySchema), async (req, res, next) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json({ data: city });
  } catch (err) {
    next(err);
  }
});

citiesAdminRouter.patch('/:id', validateBody(updateCitySchema), async (req, res, next) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!city) {
      throw new ApiError(404, 'CITY_NOT_FOUND', 'Ville introuvable');
    }

    res.json({ data: city });
  } catch (err) {
    next(err);
  }
});

citiesAdminRouter.get('/meeting-points', async (_req, res, next) => {
  try {
    const meetingPoints = await MeetingPoint.find().populate('cityId', 'nom slug').sort({ nom: 1 });
    res.json({ data: meetingPoints });
  } catch (err) {
    next(err);
  }
});

citiesAdminRouter.post(
  '/:cityId/meeting-points',
  validateBody(createMeetingPointBodySchema),
  async (req, res, next) => {
    try {
      const meetingPoint = await MeetingPoint.create({
        ...req.body,
        cityId: req.params.cityId,
      });
      res.status(201).json({ data: meetingPoint });
    } catch (err) {
      next(err);
    }
  },
);

citiesAdminRouter.patch(
  '/meeting-points/:id',
  validateBody(updateMeetingPointSchema),
  async (req, res, next) => {
    try {
      const meetingPoint = await MeetingPoint.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!meetingPoint) {
        throw new ApiError(404, 'MEETING_POINT_NOT_FOUND', 'Point de RDV introuvable');
      }

      res.json({ data: meetingPoint });
    } catch (err) {
      next(err);
    }
  },
);

citiesAdminRouter.delete('/meeting-points/:id', async (req, res, next) => {
  try {
    const meetingPoint = await MeetingPoint.findByIdAndDelete(req.params.id);

    if (!meetingPoint) {
      throw new ApiError(404, 'MEETING_POINT_NOT_FOUND', 'Point de RDV introuvable');
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
