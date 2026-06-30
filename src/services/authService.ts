import { User, Provider, Wallet } from '../models';
import {
  generateTokenPair,
  hashToken,
  compareToken,
  verifyRefreshToken,
} from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuthPayload } from '../types';

export async function registerUser(data: {
  name: string; email: string; phone: string; password: string; role: 'consumer' | 'provider';
}) {
  const existingUser = await User.findOne({ $or: [{ email: data.email }, { phone: data.phone }] });
  if (existingUser) {
    throw new AppError('User with this email or phone already exists', 409);
  }

  const user = await User.create(data);

  const referralCode = `${user.name.slice(0, 3).toUpperCase()}${Date.now().toString(36).slice(-4)}`;
  user.referralCode = referralCode;
  await user.save();

  await Wallet.create({ userId: user._id, balance: 0 });

  if (data.role === 'provider') {
    await Provider.create({
      userId: user._id,
      name: user.name,
      initials: user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
      category: 'Service Provider',
      serviceCategories: [],
      phone: user.phone,
      email: user.email,
    });
  }

  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const tokens = generateTokenPair(payload);

  const hashedRefreshToken = await hashToken(tokens.refreshToken);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    ...tokens,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      location: user.location,
      tier: user.tier,
      loyaltyPoints: user.loyaltyPoints,
    },
  };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const tokens = generateTokenPair(payload);

  const hashedRefreshToken = await hashToken(tokens.refreshToken);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    ...tokens,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      location: user.location,
      tier: user.tier,
      loyaltyPoints: user.loyaltyPoints,
    },
  };
}

export async function refreshTokens(refreshToken: string) {
  let payload: AuthPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.refreshToken) {
    throw new AppError('Refresh token not found', 401);
  }

  const isValid = await compareToken(refreshToken, user.refreshToken);
  if (!isValid) {
    user.refreshToken = undefined;
    await user.save();
    throw new AppError('Refresh token has been revoked', 401);
  }

  const newPayload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const tokens = generateTokenPair(newPayload);

  const hashedNewToken = await hashToken(tokens.refreshToken);
  user.refreshToken = hashedNewToken;
  await user.save();

  return tokens;
}

export async function logoutUser(userId: string) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) throw new AppError('User not found', 404);

  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = await Provider.findOne({ userId: user._id });
  }

  const wallet = await Wallet.findOne({ userId: user._id });

  return {
    ...user.toObject(),
    wallet: wallet ? { balance: wallet.balance, holdBalance: wallet.holdBalance, totalAdded: wallet.totalAdded, totalCashback: wallet.totalCashback } : null,
    providerProfile,
  };
}

export async function getProfileBasic(userId: string) {
  const user = await User.findById(userId).select('name email phone role avatar location tier memberSince');
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function updateProfile(userId: string, data: Partial<{ name: string; phone: string; location: string }>) {
  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true }).select('-password -refreshToken');
  if (!user) throw new AppError('User not found', 404);
  return user;
}
