import { Counter } from '../models/Counter.js';

/** Incremente et retourne un compteur atomique nomme (numerotation continue des factures). */
export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { value: 1 } },
    { upsert: true, new: true },
  );

  return counter.value;
}
