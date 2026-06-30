import mongoose, { Schema, Document } from 'mongoose';
import type { ReferralStatus } from '../types';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  refereeId: mongoose.Types.ObjectId;
  code: string;
  status: ReferralStatus;
  rewardAmount: number;
  createdAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refereeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'rewarded', 'expired'],
      default: 'pending',
    },
    rewardAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

referralSchema.index({ referrerId: 1 });
referralSchema.index({ code: 1 });

export const Referral = mongoose.model<IReferral>('Referral', referralSchema);
