import cron from 'node-cron';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { expireStaleBookings } from '../services/booking.service.js';

/** Libere les places des reservations non payees dont le delai a expire (regle metier n°2). */
export function scheduleBookingExpiration(): void {
  cron.schedule(env.BOOKING_EXPIRATION_CRON, () => {
    expireStaleBookings()
      .then((count) => {
        if (count > 0) {
          logger.info({ count }, 'Reservations expirees liberees');
        }
      })
      .catch((err: unknown) => {
        logger.error({ err }, "Echec de la tache d'expiration des reservations");
      });
  });
}
