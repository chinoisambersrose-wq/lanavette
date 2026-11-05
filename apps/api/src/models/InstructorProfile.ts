import { GEARBOXES, type Gearbox } from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export const INSTRUCTOR_EMPLOYMENT_STATUSES = ['salarie', 'independant'] as const;
export type InstructorEmploymentStatus = (typeof INSTRUCTOR_EMPLOYMENT_STATUSES)[number];

export interface InstructorAvailability {
  debut: Date;
  fin: Date;
}

export interface InstructorProfileDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  photo?: string;
  villes: Types.ObjectId[];
  boites: Gearbox[];
  vehicule?: string;
  disponibilites: InstructorAvailability[];
  statut: InstructorEmploymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<InstructorAvailability>(
  {
    debut: { type: Date, required: true },
    fin: { type: Date, required: true },
  },
  { _id: false },
);

const instructorProfileSchema = new Schema<InstructorProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    photo: { type: String },
    villes: [{ type: Schema.Types.ObjectId, ref: 'City' }],
    boites: { type: [String], enum: GEARBOXES, default: [] },
    vehicule: { type: String },
    disponibilites: { type: [availabilitySchema], default: [] },
    statut: { type: String, enum: INSTRUCTOR_EMPLOYMENT_STATUSES, required: true },
  },
  { timestamps: true },
);

export const InstructorProfile = model<InstructorProfileDocument>(
  'InstructorProfile',
  instructorProfileSchema,
);
