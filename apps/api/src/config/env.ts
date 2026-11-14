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
  VITRINE_DEPLOY_HOOK_URL: z.string().optional(),
  BOOKING_HOLD_DURATION_MINUTES: z.coerce.number().int().positive().default(15),
  CANCELLATION_FREE_DAYS_BEFORE_START: z.coerce.number().int().nonnegative().default(7),
  BOOKING_EXPIRATION_CRON: z.string().default('*/1 * * * *'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SUCCESS_URL: z.string().default('http://localhost:5173/paiement/succes'),
  STRIPE_CANCEL_URL: z.string().default('http://localhost:5173/paiement/annule'),
  ALMA_ENABLED: z.coerce.boolean().default(false),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_SENDER_EMAIL: z.string().default('no-reply@example.com'),
  RESEND_SENDER_NAME: z.string().default('NAVETTE'),
  BREVO_API_KEY: z.string().optional(),
  BREVO_SMS_SENDER: z.string().default('NAVETTE'),
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
