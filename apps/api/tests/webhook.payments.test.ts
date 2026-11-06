import Stripe from 'stripe';
import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Booking } from '../src/models/Booking.js';
import { Payment } from '../src/models/Payment.js';
import { createBooking } from '../src/services/booking.service.js';
import { createPublishedSession, createStudent } from './helpers/fixtures.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

const WEBHOOK_SECRET = 'whsec_test_fake_secret_for_local_signature_checks_only';
const stripeTestClient = new Stripe('sk_test_fake_key_for_local_signature_checks_only');

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

function buildCheckoutCompletedPayload(bookingId: string): string {
  return JSON.stringify({
    id: 'evt_test_1',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        client_reference_id: bookingId,
        metadata: { bookingId },
      },
    },
  });
}

describe('POST /webhooks/payments', () => {
  it('rejette une signature invalide', async () => {
    const payload = buildCheckoutCompletedPayload('507f1f77bcf86cd799439011');

    const response = await supertest(app)
      .post('/api/v1/webhooks/payments')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'signature-invalide')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_SIGNATURE');
  });

  it('rejoue deux fois : un seul paiement enregistre et la reservation reste confirmee', async () => {
    const session = await createPublishedSession(1);
    const student = await createStudent();
    const booking = await createBooking(student._id, session._id);

    const payload = buildCheckoutCompletedPayload(booking._id.toString());
    const signature = stripeTestClient.webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
    });

    const first = await supertest(app)
      .post('/api/v1/webhooks/payments')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload);

    expect(first.status).toBe(200);

    const second = await supertest(app)
      .post('/api/v1/webhooks/payments')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload);

    expect(second.status).toBe(200);

    const payments = await Payment.find({ bookingId: booking._id });
    expect(payments).toHaveLength(1);

    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking?.statut).toBe('confirmee');
  });
});
