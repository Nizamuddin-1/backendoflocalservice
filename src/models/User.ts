import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'consumer' | 'provider' | 'admin';
  avatar: string;
  location: string;
  memberSince: Date;
  tier: 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints: number;
  totalSpent: number;
  bookingsCount: number;
  savedAddresses: string[];
  isAvailable: boolean;
  referralCode: string;
  referredBy?: string;
  refreshToken?: string;
  isPhoneVerified: boolean;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['consumer', 'provider', 'admin'], required: true },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    memberSince: { type: Date, default: Date.now },
    tier: { type: String, enum: ['Silver', 'Gold', 'Platinum'], default: 'Silver' },
    loyaltyPoints: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
    savedAddresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
    isAvailable: { type: Boolean, default: true },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String },
    refreshToken: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    fcmToken: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
