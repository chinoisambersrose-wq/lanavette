import { createExamResultSchema } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ExamResult } from '../../models/ExamResult.js';
import { createExamResult, getExamResultStats } from '../../services/examResult.service.js';

export const examResultsAdminRouter = Router();

examResultsAdminRouter.use(requireAuth, requireRole('admin'));

examResultsAdminRouter.get('/', async (_req, res, next) => {
  try {
    const results = await ExamResult.find()
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'studentId', select: 'prenom nom' },
          { path: 'sessionId', populate: 'formulaId' },
        ],
      })
      .sort({ date: -1 });

    res.json({ data: results });
  } catch (err) {
    next(err);
  }
});

examResultsAdminRouter.get('/stats', async (req, res, next) => {
  try {
    const groupBy =
      req.query.groupBy === 'city' || req.query.groupBy === 'instructor'
        ? req.query.groupBy
        : 'formula';

    const stats = await getExamResultStats(groupBy);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

examResultsAdminRouter.post('/', validateBody(createExamResultSchema), async (req, res, next) => {
  try {
    const examResult = await createExamResult(req.body);
    res.status(201).json({ data: examResult });
  } catch (err) {
    next(err);
  }
});
