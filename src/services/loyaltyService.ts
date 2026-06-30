import { User, Booking, Wallet } from '../models';
import { AppError } from '../middleware/errorHandler';

const POINTS_PER_RUPEE = 0.1;
const TIER_THRESHOLDS = {
  Silver: 0,
  Gold: 2000,
  Platinum: 5000,
} as const;

const REWARD_CATALOG = [
  { id: 'r1', label: '₹50 Off', pts: 500, discount: 50 },
  { id: 'r2', label: 'Free Visit', pts: 800, discount: 0 },
  { id: 'r3', label: 'Priority Slot', pts: 1000, discount: 0 },
  { id: 'r4', label: '₹200 Off', pts: 1500, discount: 200 },
] as const;

export function calculateTier(points: number): 'Silver' | 'Gold' | 'Platinum' {
  if (points >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (points >= TIER_THRESHOLDS.Gold) return 'Gold';
  return 'Silver';
}

export function getPointsToNextTier(
  currentTier: 'Silver' | 'Gold' | 'Platinum',
  currentPoints: number
): { nextTier: string | null; pointsNeeded: number } {
  switch (currentTier) {
    case 'Silver':
      return { nextTier: 'Gold', pointsNeeded: TIER_THRESHOLDS.Gold - currentPoints };
    case 'Gold':
      return { nextTier: 'Platinum', pointsNeeded: TIER_THRESHOLDS.Platinum - currentPoints };
    case 'Platinum':
      return { nextTier: null, pointsNeeded: 0 };
  }
}

export async function accruePoints(userId: string, bookingAmount: number) {
  try {
    const pointsEarned = Math.floor(bookingAmount * POINTS_PER_RUPEE);
    if (pointsEarned <= 0) return { pointsEarned: 0, newTotal: 0, tier: 'Silver' as const };

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { loyaltyPoints: pointsEarned } },
      { new: true }
    );
    if (!user) throw new AppError('User not found', 404);

    const newTier = calculateTier(user.loyaltyPoints);
    if (newTier !== user.tier) {
      user.tier = newTier;
      await user.save();
    }

    return {
      pointsEarned,
      newTotal: user.loyaltyPoints,
      tier: user.tier,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to accrue loyalty points', 500);
  }
}

export async function redeemReward(userId: string, rewardId: string) {
  try {
    const reward = REWARD_CATALOG.find((r) => r.id === rewardId);
    if (!reward) throw new AppError('Reward not found', 404);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.loyaltyPoints < reward.pts) {
      throw new AppError(
        `Insufficient points. Need ${reward.pts}, have ${user.loyaltyPoints}`,
        400
      );
    }

    user.loyaltyPoints -= reward.pts;
    await user.save();

    if (reward.discount > 0) {
      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        wallet.balance += reward.discount;
        wallet.totalCashback += reward.discount;
        await wallet.save();
      }
    }

    return {
      redeemed: true,
      reward: reward.label,
      pointsDeducted: reward.pts,
      remainingPoints: user.loyaltyPoints,
      discountApplied: reward.discount,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to redeem reward', 500);
  }
}

export async function getLoyaltyInfo(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const bookings = await Booking.find({
      consumerId: userId,
      status: 'completed',
    });
    const totalSpent = bookings.reduce((sum, b) => sum + b.price, 0);

    const { nextTier, pointsNeeded } = getPointsToNextTier(
      user.tier,
      user.loyaltyPoints
    );

    return {
      points: user.loyaltyPoints,
      tier: user.tier,
      totalSpent,
      bookingsCount: bookings.length,
      pointsToNextTier: pointsNeeded,
      nextTier,
      rewards: REWARD_CATALOG.map((r) => ({
        id: r.id,
        label: r.label,
        pts: r.pts,
      })),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get loyalty info', 500);
  }
}
