import mongoose from 'mongoose';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';

export async function checkProfileConflict(
  userId: string,
  params: { email?: string; phone?: string }
): Promise<void> {
  const conditions: Array<{ email?: string; phone?: string }> = [];

  if (params.email) {
    conditions.push({ email: params.email.toLowerCase().trim() });
  }
  if (params.phone) {
    conditions.push({ phone: params.phone.trim() });
  }

  if (conditions.length === 0) return;

  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const existing = await User.findOne({
    _id: { $ne: userObjectId },
    $or: conditions,
  });

  if (existing) {
    if (params.email && existing.email.toLowerCase() === params.email.toLowerCase().trim()) {
      throw new AppError('Email is already registered to another account', 409);
    }
    if (params.phone && existing.phone.trim() === params.phone.trim()) {
      throw new AppError('Phone number is already registered to another account', 409);
    }
    throw new AppError('Email or phone number is already registered to another account', 409);
  }
}
