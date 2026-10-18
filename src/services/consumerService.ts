import {
  Service, ServiceCategory, Booking, Wallet, Promo, Offer, User,
  ServiceVariation, Review, Address, Favorite, Dispute, Provider, Notification,
} from '../models';
import { AppError } from '../middleware/errorHandler';
import * as walletService from './walletService';
import * as bookingService from './bookingService';
import * as loyaltyService from './loyaltyService';
import * as notificationService from './notificationService';

export async function getConsumerStats(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const bookings = await Booking.find({ consumerId: userId });
    const wallet = await Wallet.findOne({ userId });
    const activeBookings = bookings.filter(
      (b) => b.status === 'upcoming' || b.status === 'ongoing'
    ).length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;

    return {
      bookingsDone: completedBookings,
      totalSaved: user.totalSpent,
      walletBalance: wallet?.balance || 0,
      loyaltyPoints: user.loyaltyPoints,
      avgRating: 4.8,
      activeOffers: activeBookings,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get consumer stats', 500);
  }
}

export async function getCategories() {
  try {
    return ServiceCategory.find({ isActive: true }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get categories', 500);
  }
}

export async function getServices(query: {
  category?: string;
  search?: string;
  sort?: string;
  minRating?: number;
  maxPrice?: number;
  verified?: boolean;
}): Promise<any> {
  try {
    const filter: any = { isActive: true };

    if (query.category && query.category !== 'all') {
      const cat = await ServiceCategory.findOne({
        name: { $regex: query.category, $options: 'i' },
      });
      if (cat) filter.categoryId = cat._id;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { provider: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.minRating) {
      filter.rating = { $gte: query.minRating };
    }

    if (query.maxPrice) {
      filter.price = { $lte: query.maxPrice };
    }

    if (query.verified) {
      filter.verified = true;
    }

    let sortOption: Record<string, 1 | -1> = { reviews: -1 };
    if (query.sort === 'price') sortOption = { price: 1 };
    else if (query.sort === 'rating') sortOption = { rating: -1 };
    else if (query.sort === 'newest') sortOption = { createdAt: -1 };

    const services = await Service.find(filter).sort(sortOption).lean();
    
    // Fetch variations for each service
    const servicesWithVariations = await Promise.all(
      services.map(async (service) => {
        const variations = await ServiceVariation.find({ serviceId: service._id }).lean();
        return { ...service, variations };
      })
    );

    return servicesWithVariations;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get services', 500);
  }
}

export async function getServiceDetail(serviceId: string) {
  try {
    const service = await Service.findById(serviceId).lean();
    if (!service) throw new AppError('Service not found', 404);

    const variations = await ServiceVariation.find({ serviceId }).lean();
    return { ...(service as Record<string, unknown>), variations };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get service detail', 500);
  }
}

export async function getConsumerBookings(userId: string, status?: string) {
  try {
    return bookingService.getConsumerBookings(userId, status);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get consumer bookings', 500);
  }
}

export async function createBooking(userId: string, data: {
  serviceId: string;
  variationId?: string;
  scheduledAt: string;
  address: string;
  city?: string;
}) {
  try {
    const booking = await bookingService.createBooking(userId, data);

    const service = await Service.findById(data.serviceId);
    if (service) {
      const providerUser = await Provider.findOne({
        $or: [
          { _id: service.providerUserId },
          { userId: service.providerUserId },
        ],
      });
      if (providerUser) {
        const user = await User.findById(userId);
        await notificationService.notifyBookingCreated(
          booking._id.toString(),
          user?.name || 'Customer',
          service.name,
          providerUser.userId.toString()
        );
      }
    }

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create booking', 500);
  }
}

export async function cancelBooking(bookingId: string, userId: string, reason?: string) {
  try {
    const booking = await bookingService.cancelBooking(bookingId, userId, 'consumer', reason);

    if (booking.providerId) {
      const provider = await Provider.findById(booking.providerId);
      if (provider) {
        await notificationService.notifyBookingCancelled(
          bookingId,
          'consumer',
          provider.userId.toString()
        );
      }
    }

    if (booking.payment === 'prepaid' && booking.isPaid) {
      await walletService.refund(userId, booking.totalAmount, booking.bookingRef);
      await notificationService.notifyPayment(userId, booking.totalAmount, 'refund');
    }

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to cancel booking', 500);
  }
}

export async function rescheduleBooking(bookingId: string, userId: string, newScheduledAt: string) {
  try {
    return bookingService.rescheduleBooking(bookingId, userId, newScheduledAt);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to reschedule booking', 500);
  }
}

export async function rateBooking(bookingId: string, userId: string, rating: number, comment?: string, title?: string) {
  try {
    const booking = await Booking.findOne({ _id: bookingId, consumerId: userId });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status !== 'completed') throw new AppError('Can only rate completed bookings', 400);
    if (!booking.providerId) throw new AppError('No provider assigned to this booking', 400);

    const review = await Review.create({
      bookingId: booking._id,
      consumerId: userId,
      providerId: booking.providerId,
      serviceId: booking.serviceVariantId || booking.providerId,
      rating,
      title: title || '',
      comment: comment || '',
      isVerified: true,
    });

    booking.rating = rating;
    booking.canReview = false;
    booking.reviewId = review._id;
    await booking.save();

    const provider = await Provider.findById(booking.providerId);
    if (provider) {
      provider.reviewCount += 1;
      provider.rating =
        ((provider.rating * (provider.reviewCount - 1)) + rating) /
        provider.reviewCount;
      await provider.save();

      await notificationService.notifyReviewReceived(
        bookingId,
        rating,
        provider.userId.toString()
      );

      await loyaltyService.accruePoints(userId, booking.totalAmount);
      await walletService.addCashback(userId, Math.floor(booking.totalAmount * 0.02), booking.bookingRef);
    }

    return { booking, review };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to rate booking', 500);
  }
}

export async function verifyOtp(bookingId: string, userId: string, otp: string) {
  try {
    return bookingService.verifyOTP(bookingId, otp, userId, 'consumer');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to verify OTP', 500);
  }
}

export async function getTransactions(userId: string, dateFilter?: string) {
  try {
    return walletService.getTransactions(userId, dateFilter);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get transactions', 500);
  }
}

export async function getWalletInfo(userId: string) {
  try {
    return walletService.getWalletInfo(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get wallet info', 500);
  }
}

export async function addMoney(userId: string, amount: number) {
  try {
    const result = await walletService.addMoney(userId, amount);
    await notificationService.notifyPayment(userId, amount, 'credit');
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to add money', 500);
  }
}

export async function getPromos() {
  try {
    return Promo.find({ isActive: true }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get promos', 500);
  }
}

export async function getOffers() {
  try {
    return Offer.find({ isActive: true }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get offers', 500);
  }
}

export async function getLoyaltyInfo(userId: string) {
  try {
    return loyaltyService.getLoyaltyInfo(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get loyalty info', 500);
  }
}

// ── Addresses ──────────────────────────────────────────────────────────────

export async function getAddresses(userId: string) {
  try {
    return Address.find({ userId }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get addresses', 500);
  }
}

export async function createAddress(userId: string, data: {
  label: string;
  fullAddress: string;
  city: string;
  pincode: string;
  coordinates?: any;
  isDefault?: boolean;
}) {
  try {
    const address = await Address.create({ ...data, userId });

    if (data.isDefault) {
      await Address.updateMany(
        { userId, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );
    }

    await User.findByIdAndUpdate(userId, { $push: { savedAddresses: address._id } });
    return address;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create address', 500);
  }
}

export async function updateAddress(userId: string, addressId: string, data: any) {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: data },
      { new: true }
    );
    if (!address) throw new AppError('Address not found', 404);

    if (data.isDefault) {
      await Address.updateMany(
        { userId, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );
    }

    return address;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update address', 500);
  }
}

export async function deleteAddress(userId: string, addressId: string) {
  try {
    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) throw new AppError('Address not found', 404);

    await User.findByIdAndUpdate(userId, { $pull: { savedAddresses: addressId } });
    return { message: 'Address deleted' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete address', 500);
  }
}

// ── Favorites ──────────────────────────────────────────────────────────────

export async function getFavorites(userId: string) {
  try {
    const favorites = await Favorite.find({ userId }).populate('serviceId').lean();
    return favorites.filter((f) => f.serviceId).map((f) => f.serviceId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get favorites', 500);
  }
}

export async function toggleFavorite(userId: string, data: { serviceId?: string; providerId?: string }) {
  try {
    const existing = await Favorite.findOne({
      userId,
      ...(data.serviceId ? { serviceId: data.serviceId } : {}),
      ...(data.providerId ? { providerId: data.providerId } : {}),
    });

    if (existing) {
      await existing.deleteOne();
      return { favorited: false };
    }

    await Favorite.create({ userId, ...data });
    return { favorited: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to toggle favorite', 500);
  }
}

// ── Disputes ────────────────────────────────────────────────────────────────

export async function createDispute(userId: string, data: { bookingId: string; reason: string; description: string }) {
  try {
    const booking = await Booking.findById(data.bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const dispute = await Dispute.create({
      bookingId: data.bookingId,
      raisedBy: userId,
      raisedAgainst: booking.providerId || userId,
      reason: data.reason,
      description: data.description,
    });

    return dispute;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create dispute', 500);
  }
}

// ── Notifications ──────────────────────────────────────────────────────────

export async function getNotifications(userId: string, page = 1, limit = 20) {
  try {
    return notificationService.getNotifications(userId, page, limit);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get notifications', 500);
  }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  try {
    return notificationService.markNotificationRead(userId, notificationId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to mark notification read', 500);
  }
}
