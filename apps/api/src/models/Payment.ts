import { Schema, model, type Document, type Types } from 'mongoose';

export const PAYMENT_STATUSES = ['en_attente', 'paye', 'echoue', 'remborse'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface PaymentDocument extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  montant: number;
  statut: PaymentStatus;
  prestataire: string;
  referencePrestataire?: string;
  numeroFacture?: string;
  echeance?: Date;
  payeLe?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    montant: { type: Number, required: true, min: 0 },
    statut: { type: String, enum: PAYMENT_STATUSES, default: 'en_attente' },
    prestataire: { type: String, required: true },
    referencePrestataire: { type: String, unique: true, sparse: true },
    numeroFacture: { type: String, unique: true, sparse: true },
    echeance: { type: Date },
    payeLe: { type: Date },
  },
  { timestamps: true },
);

paymentSchema.index({ bookingId: 1 });

export const Payment = model<PaymentDocument>('Payment', paymentSchema);
