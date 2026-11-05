import { Schema, model, type Document, type Types } from 'mongoose';

export interface ExamSlotDocument extends Document {
  _id: Types.ObjectId;
  cityId: Types.ObjectId;
  date: Date;
  centreExamen: string;
  placesTotal: number;
  placesAffectees: number;
  createdAt: Date;
  updatedAt: Date;
}

const examSlotSchema = new Schema<ExamSlotDocument>(
  {
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    date: { type: Date, required: true },
    centreExamen: { type: String, required: true },
    placesTotal: { type: Number, required: true, min: 0 },
    placesAffectees: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const ExamSlot = model<ExamSlotDocument>('ExamSlot', examSlotSchema);
