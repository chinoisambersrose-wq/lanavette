import { DOCUMENT_TYPES } from 'shared';
import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { getSignedDownloadUrl, uploadPrivateFile } from '../services/storage.service.js';

export const documentsRouter = Router();

const requireEleve = [requireAuth, requireRole('eleve')] as const;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function withSignedUrls<T extends { url: string }>(
  documents: T[],
): Promise<Array<T & { url: string }>> {
  return Promise.all(
    documents.map(async (doc) => ({ ...doc, url: await getSignedDownloadUrl(doc.url) })),
  );
}

documentsRouter.get('/me/documents', ...requireEleve, async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user!.sub });

    if (!profile) {
      res.json({ data: [] });
      return;
    }

    const documents = await withSignedUrls(
      profile.documents.map((d) => ({ _id: d._id, type: d.type, url: d.url, statut: d.statut })),
    );
    res.json({ data: documents });
  } catch (err) {
    next(err);
  }
});

documentsRouter.post(
  '/me/documents',
  ...requireEleve,
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { type } = req.body as { type?: string };
      const file = req.file;

      if (!type || !(DOCUMENT_TYPES as readonly string[]).includes(type)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Type de document invalide');
      }

      if (!file) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Fichier manquant');
      }

      const key = await uploadPrivateFile(
        `documents/${req.user!.sub}`,
        file.originalname,
        file.buffer,
        file.mimetype,
      );

      const profile = await StudentProfile.findOneAndUpdate(
        { userId: req.user!.sub },
        { $push: { documents: { type, url: key, statut: 'recu' } } },
        { upsert: true, new: true },
      );

      res.status(201).json({ data: profile.documents.at(-1) });
    } catch (err) {
      next(err);
    }
  },
);
