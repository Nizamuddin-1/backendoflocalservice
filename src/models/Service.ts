import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  provider: string;
  providerInitials: string;
  providerUserId: mongoose.Types.ObjectId;
  categoryLabel: string;
  mcIcon: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  tags: string[];
  eta: string;
  verified: boolean;
  accentColor: string;
  accentBg: string;
  jobCount: number;
  shortDesc: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    name: { type: String, required: true, trim: true },
    provider: { type: String, required: true },
    providerInitials: { type: String, required: true },
    providerUserId: { type: Schema.Types.ObjectId, ref: 'Provider' },
    categoryLabel: { type: String, required: true },
    mcIcon: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    badge: { type: String },
    tags: [{ type: String }],
    eta: { type: String, required: true },
    verified: { type: Boolean, default: false },
    accentColor: { type: String, required: true },
    accentBg: { type: String, required: true },
    jobCount: { type: Number, default: 0 },
    shortDesc: { type: String, required: true },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ name: 'text', provider: 'text', shortDesc: 'text' });
serviceSchema.index({ price: 1 });
serviceSchema.index({ rating: -1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);
