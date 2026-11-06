import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Booking } from '../src/models/Booking.js';
import { hashPassword } from '../src/services/auth.service.js';
import { createBooking } from '../src/services/booking.service.js';
import { User } from '../src/models/User.js';
import { createPublishedSession, createStudent } from './helpers/fixtures.js';
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

async function loginAsAdmin(): Promise<string> {
  const motDePasseHash = await hashPassword('MotDePasseSuperSur1');
  await User.create({
    email: 'admin@test.local',
    motDePasseHash,
    role: 'admin',
    prenom: 'Admin',
    nom: 'Test',
    telephone: '0600000001',
  });

  const login = await supertest(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@test.local', motDePasse: 'MotDePasseSuperSur1' });

  return login.body.data.accessToken;
}

describe("resultats d'examen", () => {
  it("la saisie d'un resultat cloture la reservation et calcule le taux de reussite", async () => {
    const session = await createPublishedSession(1);
    const student = await createStudent();
    const booking = await createBooking(student._id, session._id);

    const accessToken = await loginAsAdmin();

    const createResponse = await supertest(app)
      .post('/api/v1/admin/exam-results')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        bookingId: booking._id.toString(),
        examSlotId: session.examSlotId!.toString(),
        date: new Date().toISOString(),
        resultat: 'admis',
      });

    expect(createResponse.status).toBe(201);

    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking?.statut).toBe('terminee');

    const statsResponse = await supertest(app)
      .get('/api/v1/admin/exam-results/stats?groupBy=formula')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(statsResponse.status).toBe(200);
    expect(statsResponse.body.data).toHaveLength(1);
    expect(statsResponse.body.data[0].tauxReussite).toBe(100);
  });
});
