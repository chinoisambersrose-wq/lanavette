import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createBooking, expireStaleBookings } from '../src/services/booking.service.js';
import { Booking } from '../src/models/Booking.js';
import { Session } from '../src/models/Session.js';
import { createPublishedSession, createStudent } from './helpers/fixtures.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

beforeAll(async () => {
  await startTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('pas de survente (regle metier n°1)', () => {
  it('deux reservations simultanees sur la derniere place : une seule reussit', async () => {
    const session = await createPublishedSession(1);
    const [student1, student2] = await Promise.all([createStudent(), createStudent()]);

    const results = await Promise.allSettled([
      createBooking(student1._id, session._id),
      createBooking(student2._id, session._id),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const updatedSession = await Session.findById(session._id);
    expect(updatedSession?.placesRestantes).toBe(0);
  });

  it('une reservation expiree libere la place (regle metier n°2)', async () => {
    const session = await createPublishedSession(1);
    const student = await createStudent();

    const booking = await createBooking(student._id, session._id);
    expect((await Session.findById(session._id))?.placesRestantes).toBe(0);

    // Simule l'expiration du delai de blocage en reculant la date d'expiration.
    booking.expireAt = new Date(Date.now() - 1000);
    await booking.save();

    const expiredCount = await expireStaleBookings();
    expect(expiredCount).toBe(1);

    const updatedSession = await Session.findById(session._id);
    expect(updatedSession?.placesRestantes).toBe(1);

    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking?.statut).toBe('annulee');
  });
});
