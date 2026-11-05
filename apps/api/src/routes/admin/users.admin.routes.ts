import { ROLES } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { User } from '../../models/User.js';
import { recordAuditLog } from '../../services/auditLog.service.js';

export const usersAdminRouter = Router();

usersAdminRouter.use(requireAuth, requireRole('admin'));

usersAdminRouter.get('/', async (req, res, next) => {
  try {
    const { role } = req.query as { role?: string };
    const filter = role && (ROLES as readonly string[]).includes(role) ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
});

usersAdminRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'Utilisateur introuvable');
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

usersAdminRouter.patch('/:id/active', async (req, res, next) => {
  try {
    const { actif } = req.body as { actif?: boolean };

    if (typeof actif !== 'boolean') {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Le champ actif (booleen) est requis');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'Utilisateur introuvable');
    }

    const avant = user.toObject();
    user.actif = actif;
    await user.save();
    await recordAuditLog(req.user!.sub, 'user.toggle_active', avant, user.toObject());

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});
