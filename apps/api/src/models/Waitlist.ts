import { Schema, model, type Document, type Types } from 'mongoose';

export interface WaitlistDocument extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  sessionId: Types.ObjectId;
  notifie: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistSchema = new Schema<WaitlistDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    notifie: { type: Boolean, default: false },
  },
  { timestamps: true },
);

waitlistSchema.index({ sessionId: 1, createdAt: 1 });
waitlistSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

export const Waitlist = model<WaitlistDocument>('Waitlist', waitlistSchema);
