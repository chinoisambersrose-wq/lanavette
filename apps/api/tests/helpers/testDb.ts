import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let memoryServer: MongoMemoryServer | undefined;

export async function startTestDb(): Promise<void> {
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());

  // Voir config/db.ts : attend la construction des index (uniques compris) avant les premiers
  // tests, sinon une contrainte d'unicite testee juste apres la connexion peut ne pas etre active.
  await Promise.all(Object.values(mongoose.connection.models).map((model) => model.init()));
}

export async function stopTestDb(): Promise<void> {
  await mongoose.disconnect();
  await memoryServer?.stop();
}

export async function clearTestDb(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}
