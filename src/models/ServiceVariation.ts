import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceVariation extends Document {
  serviceId: mongoose.Types.ObjectId;
  label: string;
  desc: string;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  mcIcon: string;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceVariationSchema = new Schema<IServiceVariation>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    label: { type: String, required: true },
    desc: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    popular: { type: Boolean, default: false },
    mcIcon: { type: String, required: true },
    duration: { type: String, required: true },
  },
  { timestamps: true }
);

serviceVariationSchema.index({ serviceId: 1 });

export const ServiceVariation = mongoose.model<IServiceVariation>('ServiceVariation', serviceVariationSchema);
