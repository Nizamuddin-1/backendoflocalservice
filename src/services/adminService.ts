import { User, Provider, Booking, Wallet, Review, Dispute, Service, Promo, Offer } from '../models';
import { AppError } from '../middleware/errorHandler';

export async function getUsers() {
  try {
    return await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch users', 500);
  }
}

export async function getProviders() {
  try {
    return await Provider.find().sort({ createdAt: -1 });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch providers', 500);
  }
}

export async function getBookings(status?: string, page = 1, limit = 50) {
  try {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('consumerId', 'name phone email')
        .populate('providerId', 'name phone email')
        .populate('serviceId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch bookings', 500);
  }
}

export async function getDisputes() {
  try {
    return await Dispute.find()
      .populate('bookingId')
      .populate('raisedBy', 'name phone email')
      .sort({ createdAt: -1 });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch disputes', 500);
  }
}

export async function resolveDispute(disputeId: string, status: 'open' | 'investigating' | 'resolved' | 'closed', resolution: string) {
  try {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) throw new AppError('Dispute not found', 404);

    dispute.status = status;
    dispute.resolution = resolution;
    await dispute.save();

    if (status === 'resolved') {
      const booking = await Booking.findById(dispute.bookingId);
      if (booking) {
        const wallet = await Wallet.findOne({ userId: booking.consumerId });
        if (wallet) {
          wallet.balance += booking.price;
          await wallet.save();
        }
      }
    }

    return dispute;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to resolve dispute', 500);
  }
}

export async function getPlatformStats() {
  try {
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      completedBookings,
      totalRevenue,
      pendingDisputes,
      activeServices,
    ] = await Promise.all([
      User.countDocuments(),
      Provider.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      Dispute.countDocuments({ status: 'pending' }),
      Service.countDocuments({ isActive: true }),
    ]);

    return {
      totalUsers,
      totalProviders,
      totalBookings,
      completedBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingDisputes,
      activeServices,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch platform stats', 500);
  }
}

export async function createPromo(data: {
  code: string;
  title: string;
  description?: string;
  discount: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  validFrom?: Date;
  validUntil?: Date;
}) {
  try {
    const existing = await Promo.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new AppError('Promo code already exists', 409);

    const promo = await Promo.create({
      ...data,
      code: data.code.toUpperCase(),
      validFrom: data.validFrom || new Date(),
      validUntil: data.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return promo;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create promo', 500);
  }
}

export async function updatePromo(promoId: string, data: Partial<{
  title: string;
  description: string;
  discount: number;
  maxDiscount: number;
  minOrderAmount: number;
  usageLimit: number;
  validUntil: Date;
  isActive: boolean;
}>) {
  try {
    const promo = await Promo.findByIdAndUpdate(promoId, { $set: data }, { new: true });
    if (!promo) throw new AppError('Promo not found', 404);
    return promo;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update promo', 500);
  }
}

export async function deletePromo(promoId: string) {
  try {
    const promo = await Promo.findByIdAndUpdate(
      promoId,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!promo) throw new AppError('Promo not found', 404);
    return { message: 'Promo deactivated' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete promo', 500);
  }
}

export async function createOffer(data: {
  title: string;
  description?: string;
  discountPercent?: number;
  flatDiscount?: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  serviceId?: string;
  providerId?: string;
  validFrom?: Date;
  validUntil?: Date;
}) {
  try {
    const offer = await Offer.create({
      ...data,
      validFrom: data.validFrom || new Date(),
      validUntil: data.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });
    return offer;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create offer', 500);
  }
}

export async function updateOffer(offerId: string, data: Partial<{
  title: string;
  description: string;
  discountPercent: number;
  flatDiscount: number;
  maxDiscount: number;
  minOrderAmount: number;
  validUntil: Date;
  isActive: boolean;
}>) {
  try {
    const offer = await Offer.findByIdAndUpdate(offerId, { $set: data }, { new: true });
    if (!offer) throw new AppError('Offer not found', 404);
    return offer;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update offer', 500);
  }
}

export async function deleteOffer(offerId: string) {
  try {
    const offer = await Offer.findByIdAndUpdate(
      offerId,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!offer) throw new AppError('Offer not found', 404);
    return { message: 'Offer deactivated' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete offer', 500);
  }
}
