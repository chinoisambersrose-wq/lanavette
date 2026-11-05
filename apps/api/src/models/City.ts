import { Schema, model, type Document, type Types } from 'mongoose';

export interface CityDocument extends Document {
  _id: Types.ObjectId;
  slug: string;
  nom: string;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<CityDocument>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nom: { type: String, required: true },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const City = model<CityDocument>('City', citySchema);
