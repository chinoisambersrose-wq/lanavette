import { S3Client } from '@aws-sdk/client-s3';
import { ApiError } from '../middleware/errorHandler.js';
import { env } from './env.js';

let client: S3Client | undefined;

/** Cree le client S3/R2 au premier appel. Leve une erreur claire si non configure. */
export function getS3Client(): S3Client {
  if (!env.S3_ENDPOINT || !env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new ApiError(
      503,
      'STORAGE_NOT_CONFIGURED',
      'Stockage de fichiers non configure (voir S3_* dans .env.example)',
    );
  }

  if (!client) {
    client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  return client;
}

export function getS3Bucket(): string {
  if (!env.S3_BUCKET) {
    throw new ApiError(503, 'STORAGE_NOT_CONFIGURED', 'S3_BUCKET manquant dans .env');
  }

  return env.S3_BUCKET;
}
