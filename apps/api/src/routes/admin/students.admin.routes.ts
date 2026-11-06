import { DOCUMENT_STATUSES } from 'shared';
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { User } from '../../models/User.js';
import { notifyDocumentRejected } from '../../services/notification.service.js';

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

    if (document?.statut === 'refuse') {
      const student = await User.findById(profile.userId);
      if (student) {
        await notifyDocumentRejected(
          student.email,
          `${student.prenom} ${student.nom}`,
          document.type,
        );
      }
    }

    res.json({ data: document });
  } catch (err) {
    next(err);
  }
});
