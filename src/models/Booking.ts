import mongoose, { Schema, Document } from 'mongoose';
import type { BookingStatus, ProviderBookingStatus, PaymentMethod } from '../types';

export interface IBookingCustomer {
  name: string;
  initials: string;
  rating: number;
  totalOrders: number;
  phone: string;
}

export interface IBookingServiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IBookingLocation {
  address: string;
  city: string;
  distanceKm: number;
  etaMins: number;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface IBookingStep {
  label: string;
  detail: string;
  state: 'done' | 'current' | 'pending';
  timestamp?: Date;
}

export interface IBooking extends Document {
  consumerId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  requestNo: string;
  customer: IBookingCustomer;
  status: BookingStatus;
  providerStatus: ProviderBookingStatus;
  serviceType: string;
  serviceVariantId?: mongoose.Types.ObjectId;
  serviceName: string;
  services: IBookingServiceItem[];
  location: IBookingLocation;
  scheduledAt: Date;
  durationMins: number;
  timeSlot: string;
  address: string;
  payment: PaymentMethod;
  totalAmount: number;
  price: number;
  isPaid: boolean;
  bookingRef: string;
  mcIcon: string;
  color: string;
  bg: string;
  accentColor: string;
  category: string;
  rating?: number;
  customerRating?: number;
  canReschedule?: boolean;
  canCancel?: boolean;
  canReview?: boolean;
  canTrack?: boolean;
  proAvatar: string;
  providerName: string;
  initials: string;
  date: string;
  time: string;
  steps: IBookingStep[];
  notes?: string;
  photos: string[];
  otp?: string;
  otpVerified: boolean;
  reviewId?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    consumerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider' },
    requestNo: { type: String, unique: true },
    customer: {
      name: { type: String, required: true },
      initials: { type: String, required: true },
      rating: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    providerStatus: {
      type: String,
      enum: ['new', 'active', 'pending', 'done', 'cancelled'],
      default: 'new',
    },
    serviceType: { type: String, required: true },
    serviceVariantId: { type: Schema.Types.ObjectId, ref: 'ServiceVariation' },
    serviceName: { type: String, required: true },
    services: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    location: {
      address: { type: String, required: true },
      city: { type: String, default: '' },
      distanceKm: { type: Number, default: 0 },
      etaMins: { type: Number, default: 0 },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    scheduledAt: { type: Date, required: true },
    durationMins: { type: Number, default: 60 },
    timeSlot: { type: String },
    address: { type: String },
    payment: { type: String, enum: ['prepaid', 'cash', 'upi', 'wallet'], default: 'prepaid' },
    totalAmount: { type: Number, required: true },
    price: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    bookingRef: { type: String, unique: true },
    mcIcon: { type: String, default: '' },
    color: { type: String, default: '#1B4FD8' },
    bg: { type: String, default: '#E9EFFC' },
    accentColor: { type: String, default: '#1B4FD8' },
    category: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5 },
    customerRating: { type: Number, min: 0, max: 5 },
    canReschedule: { type: Boolean, default: true },
    canCancel: { type: Boolean, default: true },
    canReview: { type: Boolean, default: true },
    canTrack: { type: Boolean, default: false },
    proAvatar: { type: String, default: '' },
    providerName: { type: String, default: '' },
    initials: { type: String, default: '' },
    date: { type: String },
    time: { type: String },
    steps: [
      {
        label: { type: String },
        detail: { type: String },
        state: { type: String, enum: ['done', 'current', 'pending'], default: 'pending' },
        timestamp: { type: Date },
      },
    ],
    notes: { type: String },
    photos: [{ type: String }],
    otp: { type: String },
    otpVerified: { type: Boolean, default: false },
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ consumerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, providerStatus: 1 });
bookingSchema.index({ scheduledAt: -1 });
bookingSchema.index({ bookingRef: 1 }, { unique: true });
bookingSchema.index({ requestNo: 1 }, { unique: true });
bookingSchema.index({ 'location.coordinates': '2dsphere' });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
