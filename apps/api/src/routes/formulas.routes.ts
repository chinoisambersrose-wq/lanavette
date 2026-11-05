import { Router } from 'express';
import { ApiError } from '../middleware/errorHandler.js';
import { Formula } from '../models/Formula.js';

export const formulasRouter = Router();

formulasRouter.get('/formulas', async (_req, res, next) => {
  try {
    const formulas = await Formula.find({ actif: true }).sort({ ordre: 1 });
    res.json({ data: formulas });
  } catch (err) {
    next(err);
  }
});

formulasRouter.get('/formulas/:slug', async (req, res, next) => {
  try {
    const formula = await Formula.findOne({ slug: req.params.slug, actif: true });

    if (!formula) {
      throw new ApiError(404, 'FORMULA_NOT_FOUND', 'Formule introuvable');
    }

    res.json({ data: formula });
  } catch (err) {
    next(err);
  }
});
