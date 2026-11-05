import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  type BookingSource,
  type BookingStatus,
  type PaymentMethod,
} from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface BookingDocument extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  sessionId: Types.ObjectId;
  statut: BookingStatus;
  montantTotal: number;
  modePaiement?: PaymentMethod;
  source: BookingSource;
  expireAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    statut: { type: String, enum: BOOKING_STATUSES, default: 'en_attente_paiement' },
    montantTotal: { type: Number, required: true, min: 0 },
    modePaiement: { type: String, enum: PAYMENT_METHODS },
    source: { type: String, enum: BOOKING_SOURCES, default: 'site' },
    expireAt: { type: Date },
  },
  { timestamps: true },
);

bookingSchema.index({ studentId: 1, statut: 1 });
bookingSchema.index({ expireAt: 1 });

export const Booking = model<BookingDocument>('Booking', bookingSchema);
