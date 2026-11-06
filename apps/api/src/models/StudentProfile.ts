import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  GEARBOXES,
  type DocumentStatus,
  type DocumentType,
  type Gearbox,
} from 'shared';
import { Schema, model, type Document, type Types } from 'mongoose';

export interface StudentDocument {
  _id: Types.ObjectId;
  type: DocumentType;
  url: string;
  statut: DocumentStatus;
}

export interface StudentProfileDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  neph?: string;
  codeObtenu: boolean;
  boitePreferee?: Gearbox;
  documents: StudentDocument[];
  notesInternes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentDocumentSchema = new Schema<StudentDocument>({
  type: { type: String, enum: DOCUMENT_TYPES, required: true },
  url: { type: String, required: true },
  statut: { type: String, enum: DOCUMENT_STATUSES, default: 'recu' },
});

const studentProfileSchema = new Schema<StudentProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    neph: { type: String },
    codeObtenu: { type: Boolean, default: false },
    boitePreferee: { type: String, enum: GEARBOXES },
    documents: { type: [studentDocumentSchema], default: [] },
    notesInternes: { type: String },
  },
  { timestamps: true },
);

export const StudentProfile = model<StudentProfileDocument>('StudentProfile', studentProfileSchema);
