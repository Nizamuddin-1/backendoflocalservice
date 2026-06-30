import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  role: 'consumer' | 'provider' | 'admin';
  tokenVersion?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type ProviderBookingStatus = 'new' | 'active' | 'pending' | 'done' | 'cancelled';
export type JobStepState = 'done' | 'current' | 'pending';
export type PaymentMethod = 'prepaid' | 'cash' | 'upi' | 'wallet';
export type TxType = 'credit' | 'debit' | 'refund' | 'cashback' | 'withdrawal' | 'payout';
export type TxStatus = 'success' | 'pending' | 'failed';
export type NotificationType = 'booking_request' | 'booking_status' | 'payment' | 'promo' | 'review' | 'system';
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type ReferralStatus = 'pending' | 'rewarded' | 'expired';
