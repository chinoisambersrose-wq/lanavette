import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Booking } from '../src/models/Booking.js';
import { InstructorProfile } from '../src/models/InstructorProfile.js';
import { signAccessToken } from '../src/services/auth.service.js';
import { createBooking } from '../src/services/booking.service.js';
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

describe('espace moniteur', () => {
  it('un eleve ne peut pas appeler une route moniteur', async () => {
    const student = await createStudent();
    const accessToken = signAccessToken({ sub: student._id.toString(), role: 'eleve' });

    const response = await supertest(app)
      .get('/api/v1/instructor/sessions')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it('un admin ne peut pas appeler une route moniteur reservee au role moniteur', async () => {
    // Garde contre la regression deja rencontree : un `.use()` sans chemin sur le routeur
    // moniteur (monte sur le prefixe partage /api/v1) interceptait aussi les routes admin.
    const accessToken = signAccessToken({ sub: '507f1f77bcf86cd799439011', role: 'admin' });

    const response = await supertest(app)
      .get('/api/v1/instructor/sessions')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it('le moniteur voit ses sessions, saisit une lecon et donne un avis de fin de stage', async () => {
    const session = await createPublishedSession(1);
    const student = await createStudent();
    await createBooking(student._id, session._id);

    await Booking.updateOne({ sessionId: session._id }, { statut: 'confirmee' });

    const instructorToken = signAccessToken({
      sub: session.instructorId.toString(),
      role: 'moniteur',
    });

    const sessionsResponse = await supertest(app)
      .get('/api/v1/instructor/sessions')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(sessionsResponse.status).toBe(200);
    expect(sessionsResponse.body.data).toHaveLength(1);

    const studentsResponse = await supertest(app)
      .get(`/api/v1/instructor/sessions/${session._id.toString()}/students`)
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(studentsResponse.status).toBe(200);
    expect(studentsResponse.body.data).toHaveLength(1);

    const bookingId = studentsResponse.body.data[0]._id;

    const lessonResponse = await supertest(app)
      .post(`/api/v1/instructor/bookings/${bookingId}/lessons`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ date: new Date().toISOString(), heures: 2, presence: 'presente' });

    expect(lessonResponse.status).toBe(201);

    const avisResponse = await supertest(app)
      .post(`/api/v1/instructor/bookings/${bookingId}/avis`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ avis: 'pas_pret' });

    expect(avisResponse.status).toBe(200);
    expect(avisResponse.body.data.avisFinStage).toBe('pas_pret');
  });

  it('le moniteur declare ses disponibilites', async () => {
    const instructorId = '507f1f77bcf86cd799439011';
    await InstructorProfile.create({
      userId: instructorId,
      boites: ['manuelle'],
      statut: 'independant',
    });

    const instructorToken = signAccessToken({ sub: instructorId, role: 'moniteur' });

    const response = await supertest(app)
      .put('/api/v1/instructor/availability')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        disponibilites: [
          { debut: new Date().toISOString(), fin: new Date(Date.now() + 86400000).toISOString() },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
