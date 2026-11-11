import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app.js';
import { City } from '../src/models/City.js';
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

describe('GET /api/v1/cities', () => {
  it('ne propose que les villes desservies et laisse les nouvelles villes masquées', async () => {
    const inactiveCity = await City.create({ slug: 'ville-en-preparation', nom: 'En préparation' });
    const activeCity = await City.create({
      slug: 'ville-desservie',
      nom: 'Ville desservie',
      actif: true,
    });

    const response = await supertest(app).get('/api/v1/cities');

    expect(response.status).toBe(200);
    expect(response.body.data.map((city: { _id: string }) => city._id)).toEqual([
      activeCity._id.toString(),
    ]);
    expect(inactiveCity.actif).toBe(false);
  });
});
