import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Payment } from '../src/models/Payment.js';
import { createBooking } from '../src/services/booking.service.js';
import { signAccessToken } from '../src/services/auth.service.js';
import { assignInvoiceNumber } from '../src/services/invoice.service.js';
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

describe('facture PDF', () => {
  it('telecharge une facture avec numerotation continue', async () => {
    const session = await createPublishedSession(1);
    const student = await createStudent();
    const booking = await createBooking(student._id, session._id);

    const payment = await Payment.create({
      bookingId: booking._id,
      montant: booking.montantTotal,
      statut: 'paye',
      prestataire: 'stripe',
      referencePrestataire: 'cs_test_invoice',
      payeLe: new Date(),
    });

    const numeroFacture = await assignInvoiceNumber(payment);
    expect(numeroFacture).toMatch(/^FAC-\d{4}-\d{6}$/);

    const accessToken = signAccessToken({ sub: student._id.toString(), role: 'eleve' });

    const response = await supertest(app)
      .get(`/api/v1/me/payments/${payment._id.toString()}/invoice`)
      .set('Authorization', `Bearer ${accessToken}`)
      .buffer()
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(100);
    expect(response.body.subarray(0, 4).toString()).toBe('%PDF');
  });

  it("refuse de telecharger la facture d'un autre eleve", async () => {
    const session = await createPublishedSession(1);
    const student = await createStudent();
    const otherStudent = await createStudent();
    const booking = await createBooking(student._id, session._id);

    const payment = await Payment.create({
      bookingId: booking._id,
      montant: booking.montantTotal,
      statut: 'paye',
      prestataire: 'stripe',
      referencePrestataire: 'cs_test_invoice_2',
      payeLe: new Date(),
    });
    await assignInvoiceNumber(payment);

    const otherAccessToken = signAccessToken({ sub: otherStudent._id.toString(), role: 'eleve' });

    const response = await supertest(app)
      .get(`/api/v1/me/payments/${payment._id.toString()}/invoice`)
      .set('Authorization', `Bearer ${otherAccessToken}`);

    expect(response.status).toBe(404);
  });
});
