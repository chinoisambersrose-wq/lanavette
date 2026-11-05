import { ROLES, type Role } from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  motDePasseHash: string;
  role: Role;
  prenom: string;
  nom: string;
  telephone: string;
  dateNaissance?: Date;
  adresse?: string;
  actif: boolean;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasseHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    prenom: { type: String, required: true },
    nom: { type: String, required: true },
    telephone: { type: String, required: true },
    dateNaissance: { type: Date },
    adresse: { type: String },
    actif: { type: Boolean, default: true },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

export const User = model<UserDocument>('User', userSchema);
