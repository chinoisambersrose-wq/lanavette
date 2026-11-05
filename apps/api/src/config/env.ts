import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  APP_ORIGIN: z.string().default('http://localhost:5173'),
  VITRINE_ORIGIN: z.string().default('http://localhost:4321'),
  BOOKING_HOLD_DURATION_MINUTES: z.coerce.number().int().positive().default(15),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
    throw new Error('Configuration invalide : voir .env.example');
  }

  return parsed.data;
}

export const env = loadEnv();
