import { User, Referral, Transaction, Wallet } from '../models';
import { AppError } from '../middleware/errorHandler';

const REFERRAL_REWARD_AMOUNT = 100;

export async function applyReferral(newUserId: string, referralCode: string) {
  const referrer = await User.findOne({ referralCode });
  if (!referrer) {
    // Invalid code, silently ignore
    return;
  }

  if (referrer._id.toString() === newUserId) {
    throw new AppError('Cannot refer yourself', 400);
  }

  const existingRef = await Referral.findOne({ refereeId: newUserId });
  if (existingRef) {
    return;
  }

  await Referral.create({
    referrerId: referrer._id,
    refereeId: newUserId,
    code: referralCode,
    status: 'pending',
    rewardAmount: REFERRAL_REWARD_AMOUNT,
  });
}

export async function rewardReferral(refereeId: string) {
  const referral = await Referral.findOne({ refereeId, status: 'pending' });
  if (!referral) return;

  const wallet = await Wallet.findOne({ userId: referral.referrerId });
  if (!wallet) return;

  wallet.balance += REFERRAL_REWARD_AMOUNT;
  wallet.totalAdded += REFERRAL_REWARD_AMOUNT;
  await wallet.save();

  await Transaction.create({
    userId: referral.referrerId,
    title: 'Referral Reward',
    subtitle: `You earned ₹${REFERRAL_REWARD_AMOUNT} for referring a friend`,
    amount: REFERRAL_REWARD_AMOUNT,
    type: 'credit',
    status: 'success',
    date: 'Today',
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    icon: 'gift-outline',
    iconColor: '#10B981',
  });

  referral.status = 'rewarded';
  await referral.save();
}
