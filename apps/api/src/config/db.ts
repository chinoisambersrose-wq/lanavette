import mongoose from 'mongoose';
import { logger } from './logger.js';

export async function connectDb(uri: string): Promise<typeof mongoose> {
  const connection = await mongoose.connect(uri);

  // Attend la construction des index (dont les index uniques, ex. waitlist studentId+sessionId)
  // avant d'accepter du trafic : par defaut, Mongoose la lance en arriere-plan sans l'attendre,
  // ce qui laisse une courte fenetre ou une contrainte d'unicite n'est pas encore active.
  await Promise.all(Object.values(connection.models).map((model) => model.init()));

  logger.info('Connecte a MongoDB');
  return connection;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
