import { Schema, model, type Document } from 'mongoose';

export interface CounterDocument extends Document<string> {
  value: number;
}

const counterSchema = new Schema<CounterDocument>({
  _id: { type: String, required: true },
  value: { type: Number, required: true, default: 0 },
});

export const Counter = model<CounterDocument>('Counter', counterSchema);
