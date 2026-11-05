import { GEARBOXES, type Gearbox } from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface MeetingPointDocument extends Document {
  _id: Types.ObjectId;
  cityId: Types.ObjectId;
  nom: string;
  adresse: string;
  location: GeoPoint;
  boites: Gearbox[];
  createdAt: Date;
  updatedAt: Date;
}

const geoPointSchema = new Schema<GeoPoint>(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

const meetingPointSchema = new Schema<MeetingPointDocument>(
  {
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    nom: { type: String, required: true },
    adresse: { type: String, required: true },
    location: { type: geoPointSchema, required: true },
    boites: { type: [String], enum: GEARBOXES, default: [] },
  },
  { timestamps: true },
);

meetingPointSchema.index({ location: '2dsphere' });

export const MeetingPoint = model<MeetingPointDocument>('MeetingPoint', meetingPointSchema);
