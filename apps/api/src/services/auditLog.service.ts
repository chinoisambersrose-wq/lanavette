import type { Types } from 'mongoose';
import { AuditLog } from '../models/AuditLog.js';

/** Trace une action sensible (prix, remboursement, exception forcee...), voir CLAUDE.md regle n°7. */
export async function recordAuditLog(
  userId: Types.ObjectId | string,
  action: string,
  avant?: unknown,
  apres?: unknown,
): Promise<void> {
  await AuditLog.create({ userId, action, avant, apres, date: new Date() });
}
