import mongoose from 'mongoose';
import { Wallet, Transaction } from '../models';
import { AppError } from '../middleware/errorHandler';

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export async function getWalletInfo(userId: string) {
  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new AppError('Wallet not found', 404);

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    const totalSpent = transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: wallet.balance,
      holdBalance: wallet.holdBalance,
      totalAdded: wallet.totalAdded,
      totalCashback: wallet.totalCashback,
      totalSpent,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get wallet info', 500);
  }
}

export async function addMoney(
  userId: string,
  amount: number,
  idempotencyKey?: string
) {
  try {
    if (amount <= 0) throw new AppError('Amount must be positive', 400);

    if (idempotencyKey) {
      const existing = await Transaction.findOne({
        userId,
        'metadata.idempotencyKey': idempotencyKey,
      });
      if (existing) {
        const wallet = await Wallet.findOne({ userId });
        return { balance: wallet?.balance || 0 };
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount, totalAdded: amount } },
        { new: true, session }
      );

      if (!wallet) {
        await session.abortTransaction();
        throw new AppError('Wallet not found', 404);
      }

      await Transaction.create(
        [
          {
            userId,
            title: 'Added to Wallet',
            subtitle: `Added ₹${amount} to wallet`,
            amount,
            type: 'credit',
            status: 'success',
            date: formatDate(),
            time: formatTime(),
            icon: 'bank-transfer-in',
            iconColor: '#10B981',
            metadata: idempotencyKey ? { idempotencyKey } : undefined,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { balance: wallet.balance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to add money', 500);
  }
}

export async function debit(
  userId: string,
  amount: number,
  bookingRef: string,
  title?: string
) {
  try {
    if (amount <= 0) throw new AppError('Amount must be positive', 400);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        await session.abortTransaction();
        throw new AppError('Wallet not found', 404);
      }

      if (wallet.balance < amount) {
        await session.abortTransaction();
        throw new AppError('Insufficient wallet balance', 400);
      }

      wallet.balance -= amount;
      await wallet.save({ session });

      await Transaction.create(
        [
          {
            userId,
            title: title || 'Booking Payment',
            subtitle: `Paid ₹${amount} for booking ${bookingRef}`,
            amount,
            type: 'debit',
            status: 'success',
            date: formatDate(),
            time: formatTime(),
            icon: 'credit-card-outline',
            iconColor: '#EF4444',
            bookingRef,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { balance: wallet.balance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to debit wallet', 500);
  }
}

export async function hold(userId: string, amount: number, bookingRef: string) {
  try {
    if (amount <= 0) throw new AppError('Amount must be positive', 400);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        await session.abortTransaction();
        throw new AppError('Wallet not found', 404);
      }

      if (wallet.balance < amount) {
        await session.abortTransaction();
        throw new AppError('Insufficient wallet balance for hold', 400);
      }

      wallet.balance -= amount;
      wallet.holdBalance += amount;
      await wallet.save({ session });

      await Transaction.create(
        [
          {
            userId,
            title: 'Amount On Hold',
            subtitle: `₹${amount} held for booking ${bookingRef}`,
            amount,
            type: 'debit',
            status: 'pending',
            date: formatDate(),
            time: formatTime(),
            icon: 'clock-outline',
            iconColor: '#F59E0B',
            bookingRef,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { balance: wallet.balance, holdBalance: wallet.holdBalance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to hold amount', 500);
  }
}

export async function releaseHold(userId: string, amount: number, bookingRef: string) {
  try {
    if (amount <= 0) throw new AppError('Amount must be positive', 400);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        await session.abortTransaction();
        throw new AppError('Wallet not found', 404);
      }

      if (wallet.holdBalance < amount) {
        await session.abortTransaction();
        throw new AppError('Hold amount exceeds available hold balance', 400);
      }

      wallet.balance += amount;
      wallet.holdBalance -= amount;
      await wallet.save({ session });

      await Transaction.create(
        [
          {
            userId,
            title: 'Hold Released',
            subtitle: `₹${amount} released from hold for booking ${bookingRef}`,
            amount,
            type: 'credit',
            status: 'success',
            date: formatDate(),
            time: formatTime(),
            icon: 'check-circle-outline',
            iconColor: '#10B981',
            bookingRef,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { balance: wallet.balance, holdBalance: wallet.holdBalance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to release hold', 500);
  }
}

export async function refund(userId: string, amount: number, bookingRef: string) {
  try {
    if (amount <= 0) throw new AppError('Amount must be positive', 400);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        await session.abortTransaction();
        throw new AppError('Wallet not found', 404);
      }

      wallet.balance += amount;
      await wallet.save({ session });

      await Transaction.create(
        [
          {
            userId,
            title: 'Refund',
            subtitle: `₹${amount} refunded for booking ${bookingRef}`,
            amount,
            type: 'refund',
            status: 'success',
            date: formatDate(),
            time: formatTime(),
            icon: 'refresh',
            iconColor: '#10B981',
            bookingRef,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { balance: wallet.balance };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to process refund', 500);
  }
}

export async function addCashback(userId: string, amount: number, bookingRef: string) {
  try {
    if (amount <= 0) return;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        await session.abortTransaction();
        throw new AppError('Wallet not found', 404);
      }

      wallet.balance += amount;
      wallet.totalCashback += amount;
      await wallet.save({ session });

      await Transaction.create(
        [
          {
            userId,
            title: 'Cashback Earned',
            subtitle: `₹${amount} cashback for booking ${bookingRef}`,
            amount,
            type: 'cashback',
            status: 'success',
            date: formatDate(),
            time: formatTime(),
            icon: 'gift-outline',
            iconColor: '#8B5CF6',
            bookingRef,
          },
        ],
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to add cashback', 500);
  }
}

export async function getTransactions(userId: string, dateFilter?: string) {
  try {
    const filter: Record<string, unknown> = { userId };
    if (dateFilter && dateFilter !== 'all') {
      filter.date = { $regex: dateFilter, $options: 'i' };
    }
    return Transaction.find(filter).sort({ createdAt: -1 }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get transactions', 500);
  }
}
