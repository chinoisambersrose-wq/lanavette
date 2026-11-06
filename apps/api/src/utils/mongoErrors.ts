interface MongoDuplicateKeyError {
  code: number;
}

/** true si l'erreur vient d'un index unique (code 11000), utile pour une creation idempotente. */
export function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as MongoDuplicateKeyError).code === 11000;
}
