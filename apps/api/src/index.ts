import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function main(): Promise<void> {
  await connectDb(env.MONGODB_URI);

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`API demarree sur http://localhost:${env.PORT}`);
  });
}

main().catch((err: unknown) => {
  logger.error({ err }, "Echec du demarrage de l'API");
  process.exit(1);
});
