import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider' },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1 });
favoriteSchema.index({ userId: 1, serviceId: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ userId: 1, providerId: 1 }, { unique: true, sparse: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
