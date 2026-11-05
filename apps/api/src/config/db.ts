import mongoose from 'mongoose';
import { logger } from './logger.js';

export async function connectDb(uri: string): Promise<typeof mongoose> {
  const connection = await mongoose.connect(uri);
  logger.info('Connecte a MongoDB');
  return connection;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
