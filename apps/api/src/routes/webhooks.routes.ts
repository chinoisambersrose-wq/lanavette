import express, { Router } from 'express';
import { getStripeClient } from '../config/stripe.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { handleStripeEvent } from '../services/payment.service.js';

export const webhooksRouter = Router();

webhooksRouter.post('/payments', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET || typeof signature !== 'string') {
    res
      .status(400)
      .json({ error: { code: 'WEBHOOK_NOT_CONFIGURED', message: 'Webhook non configure' } });
    return;
  }

  let event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.warn({ err }, 'Signature de webhook Stripe invalide');
    res.status(400).json({ error: { code: 'INVALID_SIGNATURE', message: 'Signature invalide' } });
    return;
  }

  try {
    await handleStripeEvent(event);
    res.status(200).json({ data: { received: true } });
  } catch (err) {
    logger.error({ err }, 'Echec du traitement du webhook Stripe');
    res
      .status(500)
      .json({ error: { code: 'WEBHOOK_PROCESSING_FAILED', message: 'Erreur interne' } });
  }
});
