import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/services/auth.service.js';
import { createStudent } from './helpers/fixtures.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

const app = createApp();

beforeAll(async () => {
  await startTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('POST /me/documents', () => {
  it("renvoie une erreur claire quand le stockage S3/R2 n'est pas configure", async () => {
    const student = await createStudent();
    const accessToken = signAccessToken({ sub: student._id.toString(), role: 'eleve' });

    const response = await supertest(app)
      .post('/api/v1/me/documents')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('type', 'piece_identite')
      .attach('file', Buffer.from('contenu-test'), 'piece.pdf');

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('STORAGE_NOT_CONFIGURED');
  });

  it('refuse un type de document invalide', async () => {
    const student = await createStudent();
    const accessToken = signAccessToken({ sub: student._id.toString(), role: 'eleve' });

    const response = await supertest(app)
      .post('/api/v1/me/documents')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('type', 'type-invalide')
      .attach('file', Buffer.from('contenu-test'), 'piece.pdf');

    expect(response.status).toBe(400);
  });
});
