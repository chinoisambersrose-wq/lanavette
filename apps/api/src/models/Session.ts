import { SESSION_STATUSES, type SessionStatus } from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface SessionDay {
  jour: Date;
  heureDebut: string;
  heureFin: string;
}

export interface SessionDocument extends Document {
  _id: Types.ObjectId;
  formulaId: Types.ObjectId;
  meetingPointId: Types.ObjectId;
  instructorId: Types.ObjectId;
  examSlotId?: Types.ObjectId;
  dates: SessionDay[];
  placesTotal: number;
  placesRestantes: number;
  statut: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const sessionDaySchema = new Schema<SessionDay>(
  {
    jour: { type: Date, required: true },
    heureDebut: { type: String, required: true },
    heureFin: { type: String, required: true },
  },
  { _id: false },
);

const sessionSchema = new Schema<SessionDocument>(
  {
    formulaId: { type: Schema.Types.ObjectId, ref: 'Formula', required: true },
    meetingPointId: { type: Schema.Types.ObjectId, ref: 'MeetingPoint', required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examSlotId: { type: Schema.Types.ObjectId, ref: 'ExamSlot' },
    dates: { type: [sessionDaySchema], required: true },
    placesTotal: { type: Number, required: true, min: 0 },
    placesRestantes: { type: Number, required: true, min: 0 },
    statut: { type: String, enum: SESSION_STATUSES, default: 'brouillon' },
  },
  { timestamps: true },
);

sessionSchema.index({ formulaId: 1, statut: 1, 'dates.jour': 1 });

export const Session = model<SessionDocument>('Session', sessionSchema);
