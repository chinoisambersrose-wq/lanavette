import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { hashPassword } from '../src/services/auth.service.js';
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

describe('droits par role', () => {
  it('un eleve ne peut pas appeler une route admin', async () => {
    const register = await supertest(app).post('/api/v1/auth/register').send({
      email: 'eleve@test.local',
      motDePasse: 'MotDePasseSuperSur1',
      prenom: 'Jean',
      nom: 'Dupont',
      telephone: '0600000000',
    });

    expect(register.status).toBe(201);
    const { accessToken } = register.body.data;

    const response = await supertest(app)
      .get('/api/v1/admin/formulas')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('un admin peut appeler une route admin', async () => {
    const motDePasseHash = await hashPassword('MotDePasseSuperSur1');
    await User.create({
      email: 'admin@test.local',
      motDePasseHash,
      role: 'admin',
      prenom: 'Admin',
      nom: 'Test',
      telephone: '0600000001',
    });

    const login = await supertest(app).post('/api/v1/auth/login').send({
      email: 'admin@test.local',
      motDePasse: 'MotDePasseSuperSur1',
    });

    expect(login.status).toBe(200);
    const { accessToken } = login.body.data;

    const response = await supertest(app)
      .get('/api/v1/admin/formulas')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
  });

  it('une route admin sans jeton est refusee', async () => {
    const response = await supertest(app).get('/api/v1/admin/formulas');
    expect(response.status).toBe(401);
  });
});
