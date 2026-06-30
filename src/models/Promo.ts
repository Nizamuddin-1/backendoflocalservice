import mongoose, { Schema, Document } from 'mongoose';

export interface IPromo extends Document {
  tag: string;
  headline: string;
  body: string;
  cta: string;
  accent: string;
  darkBg: string;
  mcIcon: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const promoSchema = new Schema<IPromo>(
  {
    tag: { type: String, required: true },
    headline: { type: String, required: true },
    body: { type: String, required: true },
    cta: { type: String, required: true },
    accent: { type: String, required: true },
    darkBg: { type: String, required: true },
    mcIcon: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Promo = mongoose.model<IPromo>('Promo', promoSchema);
