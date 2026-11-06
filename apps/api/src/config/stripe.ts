import Stripe from 'stripe';
import { ApiError } from '../middleware/errorHandler.js';
import { env } from './env.js';

let client: Stripe | undefined;

/** Cree le client Stripe au premier appel. Leve une erreur claire si la cle n'est pas configuree. */
export function getStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ApiError(
      503,
      'PAYMENT_PROVIDER_NOT_CONFIGURED',
      'STRIPE_SECRET_KEY manquante : configurez les cles de test Stripe dans .env (voir .env.example)',
    );
  }

  if (!client) {
    client = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return client;
}
