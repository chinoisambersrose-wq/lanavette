import { describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('repond 200 avec { data: { status: "ok" } }', async () => {
    const app = createApp();
    const response = await supertest(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: 'ok' } });
  });
});
