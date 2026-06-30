import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  consumerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  photos: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    consumerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    photos: [{ type: String }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ providerId: 1, createdAt: -1 });
reviewSchema.index({ consumerId: 1 });
reviewSchema.index({ serviceId: 1 });
reviewSchema.index({ bookingId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
