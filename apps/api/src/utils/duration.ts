const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Convertit une duree type "15m" ou "30d" (format jwt `expiresIn`) en millisecondes. */
export function durationToMs(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());

  if (!match || !match[1] || !match[2]) {
    throw new Error(`Format de duree invalide : ${duration}`);
  }

  return Number(match[1]) * UNIT_TO_MS[match[2]]!;
}
