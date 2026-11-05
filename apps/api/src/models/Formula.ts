import { FORMULA_CATEGORIES, GEARBOXES, type FormulaCategory, type Gearbox } from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface FormulaDocument extends Document {
  _id: Types.ObjectId;
  slug: string;
  nom: string;
  categorie: FormulaCategory;
  boite: Gearbox;
  heuresConduite?: number;
  dureeJours: number;
  prix: number;
  mensualiteAffichee?: number;
  pointsCles: string[];
  badge?: string;
  actif: boolean;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

const formulaSchema = new Schema<FormulaDocument>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nom: { type: String, required: true },
    categorie: { type: String, enum: FORMULA_CATEGORIES, required: true },
    boite: { type: String, enum: GEARBOXES, required: true },
    heuresConduite: { type: Number, min: 0 },
    dureeJours: { type: Number, required: true, min: 1 },
    prix: { type: Number, required: true, min: 0 },
    mensualiteAffichee: { type: Number, min: 0 },
    pointsCles: { type: [String], default: [] },
    badge: { type: String },
    actif: { type: Boolean, default: true },
    ordre: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Formula = model<FormulaDocument>('Formula', formulaSchema);
