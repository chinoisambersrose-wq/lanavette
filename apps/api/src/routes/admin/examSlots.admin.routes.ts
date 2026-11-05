import { createExamSlotSchema, updateExamSlotSchema } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { validateBody } from '../../middleware/validate.js';
import { ExamSlot } from '../../models/ExamSlot.js';

export const examSlotsAdminRouter = Router();

examSlotsAdminRouter.use(requireAuth, requireRole('admin'));

examSlotsAdminRouter.get('/', async (_req, res, next) => {
  try {
    const examSlots = await ExamSlot.find().sort({ date: 1 });
    res.json({ data: examSlots });
  } catch (err) {
    next(err);
  }
});

examSlotsAdminRouter.post('/', validateBody(createExamSlotSchema), async (req, res, next) => {
  try {
    const examSlot = await ExamSlot.create(req.body);
    res.status(201).json({ data: examSlot });
  } catch (err) {
    next(err);
  }
});

examSlotsAdminRouter.patch('/:id', validateBody(updateExamSlotSchema), async (req, res, next) => {
  try {
    const examSlot = await ExamSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!examSlot) {
      throw new ApiError(404, 'EXAM_SLOT_NOT_FOUND', "Creneau d'examen introuvable");
    }

    res.json({ data: examSlot });
  } catch (err) {
    next(err);
  }
});

examSlotsAdminRouter.delete('/:id', async (req, res, next) => {
  try {
    const examSlot = await ExamSlot.findByIdAndDelete(req.params.id);

    if (!examSlot) {
      throw new ApiError(404, 'EXAM_SLOT_NOT_FOUND', "Creneau d'examen introuvable");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
