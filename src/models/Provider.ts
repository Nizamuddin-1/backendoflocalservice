import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccount {
  bankName: string;
  maskedNo: string;
  ifscCode: string;
  accountHolderName: string;
  verified: boolean;
}

export interface IDocument {
  type: 'aadhaar' | 'experience' | 'background';
  label: string;
  status: 'verified' | 'pending' | 'rejected';
  url: string;
}

export interface IProvider extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  initials: string;
  category: string;
  serviceCategories: string[];
  rating: number;
  reviewCount: number;
  jobsDone: number;
  completionRate: number;
  totalEarned: number;
  isAvailable: boolean;
  phone: string;
  email: string;
  address: string;
  bio: string;
  languages: string[];
  bank: IBankAccount;
  documents: IDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema<IProvider>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    initials: { type: String, required: true },
    category: { type: String, required: true },
    serviceCategories: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    jobsDone: { type: Number, default: 0 },
    completionRate: { type: Number, default: 100, min: 0, max: 100 },
    totalEarned: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, default: '' },
    bio: { type: String, default: '' },
    languages: [{ type: String }],
    bank: {
      bankName: { type: String, default: '' },
      maskedNo: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      verified: { type: Boolean, default: false },
    },
    documents: [
      {
        type: { type: String, enum: ['aadhaar', 'experience', 'background'] },
        label: { type: String },
        status: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'pending' },
        url: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

providerSchema.index({ category: 1 });
providerSchema.index({ serviceCategories: 1 });
providerSchema.index({ rating: -1 });
providerSchema.index({ isAvailable: 1, category: 1 });

export const Provider = mongoose.model<IProvider>('Provider', providerSchema);
