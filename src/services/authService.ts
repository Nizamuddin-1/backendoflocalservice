import { User, Provider, Wallet } from '../models';
import { checkProfileConflict } from '../utils/checkProfileConflict';
import {
  generateTokenPair,
  hashToken,
  compareToken,
  verifyRefreshToken,
} from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuthPayload } from '../types';

export async function registerUser(data: {
  name: string; email: string; phone: string; password: string; role: 'consumer' | 'provider' | 'admin';
}) {
  try {
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to register user', 500);
  }
}

export async function loginUser(email: string, password: string) {
  try {
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to login', 500);
  }
}

export async function refreshTokens(refreshToken: string) {
  try {
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to refresh token', 500);
  }
}

export async function logoutUser(userId: string) {
  try {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: '' } });
  } catch (error) {
    throw new AppError('Failed to logout', 500);
  }
}

export async function getProfile(userId: string) {
  try {
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
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get profile', 500);
  }
}

export async function getProfileBasic(userId: string) {
  try {
    const user = await User.findById(userId).select('name email phone role avatar location tier memberSince');
    if (!user) throw new AppError('User not found', 404);
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get profile', 500);
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<{ name: string; phone: string; email: string; location: string; avatar: string }>
) {
  try {
    if (data.email || data.phone) {
      await checkProfileConflict(userId, { email: data.email, phone: data.phone });
    }

    const safeData: Record<string, any> = {};
    if (data.name !== undefined) safeData.name = data.name.trim();
    if (data.phone !== undefined) safeData.phone = data.phone.trim();
    if (data.email !== undefined) safeData.email = data.email.toLowerCase().trim();
    if (data.location !== undefined) safeData.location = data.location.trim();
    if (data.avatar !== undefined) safeData.avatar = data.avatar.trim();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: safeData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) throw new AppError('User not found', 404);

    if (user.role === 'provider') {
      const providerUpdate: Record<string, any> = {};
      if (safeData.name !== undefined) {
        providerUpdate.name = safeData.name;
        const parts = safeData.name.split(' ').filter(Boolean);
        providerUpdate.initials = parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : safeData.name.substring(0, 2).toUpperCase();
      }
      if (safeData.phone !== undefined) providerUpdate.phone = safeData.phone;
      if (safeData.email !== undefined) providerUpdate.email = safeData.email;
      if (safeData.location !== undefined) providerUpdate.address = safeData.location;

      if (Object.keys(providerUpdate).length > 0) {
        await Provider.findOneAndUpdate({ userId }, { $set: providerUpdate });
      }
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update profile', 500);
  }
}
