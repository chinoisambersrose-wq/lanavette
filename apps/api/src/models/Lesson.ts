import { LESSON_PRESENCE_STATUSES, type LessonPresenceStatus } from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface LessonDocument extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  instructorId: Types.ObjectId;
  date: Date;
  heures: number;
  competences: string[];
  commentaire?: string;
  presence: LessonPresenceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<LessonDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    heures: { type: Number, required: true, min: 0 },
    competences: { type: [String], default: [] },
    commentaire: { type: String },
    presence: { type: String, enum: LESSON_PRESENCE_STATUSES, default: 'presente' },
  },
  { timestamps: true },
);

lessonSchema.index({ bookingId: 1 });
lessonSchema.index({ instructorId: 1, date: 1 });

export const Lesson = model<LessonDocument>('Lesson', lessonSchema);
