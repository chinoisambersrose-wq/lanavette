import { DOCUMENT_STATUSES } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { StudentProfile } from '../../models/StudentProfile.js';

export const studentsAdminRouter = Router();

studentsAdminRouter.use(requireAuth, requireRole('admin'));

studentsAdminRouter.get('/:userId/documents', async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.params.userId });
    res.json({ data: profile?.documents ?? [] });
  } catch (err) {
    next(err);
  }
});

studentsAdminRouter.patch('/:userId/documents/:docId', async (req, res, next) => {
  try {
    const { statut } = req.body as { statut?: string };

    if (!statut || !(DOCUMENT_STATUSES as readonly string[]).includes(statut)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Statut de document invalide');
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.params.userId, 'documents._id': req.params.docId },
      { $set: { 'documents.$.statut': statut } },
      { new: true },
    );

    if (!profile) {
      throw new ApiError(404, 'DOCUMENT_NOT_FOUND', 'Document introuvable');
    }

    const document = profile.documents.find((d) => d._id.toString() === req.params.docId);
    res.json({ data: document });
  } catch (err) {
    next(err);
  }
});
