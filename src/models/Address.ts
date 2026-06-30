import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;
  fullAddress: string;
  city: string;
  pincode: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true },
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ userId: 1 });
addressSchema.index({ coordinates: '2dsphere' });

export const Address = mongoose.model<IAddress>('Address', addressSchema);
