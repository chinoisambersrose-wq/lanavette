import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * La vitrine est generee statiquement au build (donnees lues depuis l'API). Un changement de
 * formule en base n'apparait donc pas tant que Vercel n'a pas rebuild. Sans `VITRINE_DEPLOY_HOOK_URL`
 * (dev/preprod sans hook configure), l'appel est seulement journalise.
 */
export function triggerVitrineRedeploy(): void {
  if (!env.VITRINE_DEPLOY_HOOK_URL) {
    logger.info('[redeploy vitrine non declenche, VITRINE_DEPLOY_HOOK_URL absente]');
    return;
  }

  fetch(env.VITRINE_DEPLOY_HOOK_URL, { method: 'POST' }).catch((err) => {
    logger.error({ err }, 'Echec du declenchement du redeploy vitrine');
  });
}
