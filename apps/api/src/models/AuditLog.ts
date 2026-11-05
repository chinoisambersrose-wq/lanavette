import { Schema, model, type Document, type Types } from 'mongoose';

export interface AuditLogDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  avant?: unknown;
  apres?: unknown;
  date: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  avant: { type: Schema.Types.Mixed },
  apres: { type: Schema.Types.Mixed },
  date: { type: Date, default: Date.now },
});

auditLogSchema.index({ userId: 1, date: -1 });

export const AuditLog = model<AuditLogDocument>('AuditLog', auditLogSchema);
