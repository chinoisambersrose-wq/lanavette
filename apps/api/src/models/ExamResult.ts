import { EXAM_RESULTS, type ExamResultValue } from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface ExamResultDocument extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  examSlotId: Types.ObjectId;
  date: Date;
  resultat: ExamResultValue;
  createdAt: Date;
  updatedAt: Date;
}

const examResultSchema = new Schema<ExamResultDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    examSlotId: { type: Schema.Types.ObjectId, ref: 'ExamSlot', required: true },
    date: { type: Date, required: true },
    resultat: { type: String, enum: EXAM_RESULTS, required: true },
  },
  { timestamps: true },
);

export const ExamResult = model<ExamResultDocument>('ExamResult', examResultSchema);
