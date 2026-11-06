import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Waitlist } from '../src/models/Waitlist.js';
import { signAccessToken } from '../src/services/auth.service.js';
import { cancelBooking, createBooking } from '../src/services/booking.service.js';
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

describe("liste d'attente (regle metier n°5)", () => {
  it("un eleve s'inscrit, puis un deuxieme inscrit refuse le doublon", async () => {
    const session = await createPublishedSession(1);
    const student = await createStudent();
    const accessToken = signAccessToken({ sub: student._id.toString(), role: 'eleve' });

    const first = await supertest(app)
      .post(`/api/v1/sessions/${session._id.toString()}/waitlist`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(first.status).toBe(201);

    const second = await supertest(app)
      .post(`/api/v1/sessions/${session._id.toString()}/waitlist`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('ALREADY_WAITLISTED');
  });

  it("la liberation d'une place marque le premier inscrit de la liste d'attente comme notifie", async () => {
    const session = await createPublishedSession(1);
    const [occupant, waitlisted] = await Promise.all([createStudent(), createStudent()]);

    const booking = await createBooking(occupant._id, session._id);

    const entry = await Waitlist.create({ studentId: waitlisted._id, sessionId: session._id });
    expect(entry.notifie).toBe(false);

    await cancelBooking(booking, { forcedBy: occupant._id });

    const updatedEntry = await Waitlist.findById(entry._id);
    expect(updatedEntry?.notifie).toBe(true);
  });
});
