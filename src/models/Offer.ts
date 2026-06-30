import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  subtitle: string;
  discount: string;
  code: string;
  expiry: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    discount: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    expiry: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>('Offer', offerSchema);
