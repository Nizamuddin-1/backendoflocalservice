import mongoose, { Schema, Document } from 'mongoose';
import type { DisputeStatus } from '../types';

export interface IDispute extends Document {
  bookingId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  raisedAgainst: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    raisedAgainst: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      default: 'open',
    },
    resolution: { type: String },
  },
  { timestamps: true }
);

disputeSchema.index({ bookingId: 1 });
disputeSchema.index({ raisedBy: 1 });

export const Dispute = mongoose.model<IDispute>('Dispute', disputeSchema);
