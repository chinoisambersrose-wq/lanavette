import { randomUUID } from 'node:crypto';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Bucket, getS3Client } from '../config/s3.js';

const SIGNED_URL_TTL_SECONDS = 15 * 60;

/** Televerse un fichier et retourne sa cle (jamais l'URL directement : elle expire). */
export async function uploadPrivateFile(
  keyPrefix: string,
  originalName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const key = `${keyPrefix}/${randomUUID()}-${originalName}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return key;
}

/** Genere une URL signee a duree limitee pour un fichier prive (piece d'identite, etc.). */
export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: getS3Bucket(), Key: key });
  return getSignedUrl(getS3Client(), command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}
