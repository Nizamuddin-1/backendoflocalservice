import mongoose, { Schema, Document } from 'mongoose';
import type { TxType, TxStatus } from '../types';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  subtitle: string;
  amount: number;
  type: TxType;
  status: TxStatus;
  date: string;
  time: string;
  icon: string;
  iconColor: string;
  bookingRef?: string;
  paymentGatewayRef?: string;
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit', 'refund', 'cashback', 'withdrawal', 'payout'], required: true },
    status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    icon: { type: String, required: true },
    iconColor: { type: String, required: true },
    bookingRef: { type: String },
    paymentGatewayRef: { type: String },
    paymentMethod: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ bookingRef: 1 });
transactionSchema.index({ paymentGatewayRef: 1 }, { sparse: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
