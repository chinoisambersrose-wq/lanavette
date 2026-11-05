import { createFormulaSchema, updateFormulaSchema } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { validateBody } from '../../middleware/validate.js';
import { Formula } from '../../models/Formula.js';
import { recordAuditLog } from '../../services/auditLog.service.js';

export const formulasAdminRouter = Router();

formulasAdminRouter.use(requireAuth, requireRole('admin'));

formulasAdminRouter.get('/', async (_req, res, next) => {
  try {
    const formulas = await Formula.find().sort({ ordre: 1 });
    res.json({ data: formulas });
  } catch (err) {
    next(err);
  }
});

formulasAdminRouter.post('/', validateBody(createFormulaSchema), async (req, res, next) => {
  try {
    const formula = await Formula.create(req.body);
    await recordAuditLog(req.user!.sub, 'formula.create', undefined, formula.toObject());
    res.status(201).json({ data: formula });
  } catch (err) {
    next(err);
  }
});

formulasAdminRouter.patch('/:id', validateBody(updateFormulaSchema), async (req, res, next) => {
  try {
    const formula = await Formula.findById(req.params.id);

    if (!formula) {
      throw new ApiError(404, 'FORMULA_NOT_FOUND', 'Formule introuvable');
    }

    const avant = formula.toObject();
    formula.set(req.body);
    await formula.save();

    if (avant.prix !== formula.prix) {
      await recordAuditLog(req.user!.sub, 'formula.update_price', avant, formula.toObject());
    } else {
      await recordAuditLog(req.user!.sub, 'formula.update', avant, formula.toObject());
    }

    res.json({ data: formula });
  } catch (err) {
    next(err);
  }
});

formulasAdminRouter.delete('/:id', async (req, res, next) => {
  try {
    const formula = await Formula.findById(req.params.id);

    if (!formula) {
      throw new ApiError(404, 'FORMULA_NOT_FOUND', 'Formule introuvable');
    }

    const avant = formula.toObject();
    formula.actif = false;
    await formula.save();
    await recordAuditLog(req.user!.sub, 'formula.archive', avant, formula.toObject());

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
