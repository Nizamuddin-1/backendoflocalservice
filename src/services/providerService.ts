import {
  Provider, Booking, User, Service, ServiceCategory, ServiceCatalog, ServiceVariation, Notification, Review,
} from '../models';
import { AppError } from '../middleware/errorHandler';
import { checkProfileConflict } from '../utils/checkProfileConflict';
import * as bookingService from './bookingService';
import * as notificationService from './notificationService';

export async function getProviderProfile(userId: string) {
  try {
    let provider = await Provider.findOne({ userId });
    if (!provider) {
      const user = await User.findById(userId);
      if (user && (user.role === 'provider' || user.role === 'admin')) {
        const initials = user.name
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'PR';
        provider = await Provider.create({
          userId: user._id,
          name: user.name,
          initials,
          category: 'Service Provider',
          serviceCategories: [],
          phone: user.phone || '',
          email: user.email || '',
          address: user.location || '',
        });
      } else {
        throw new AppError('Provider profile not found', 404);
      }
    }
    return provider;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get provider profile', 500);
  }
}

export async function updateProviderProfile(userId: string, data: any) {
  try {
    if (data.email || data.phone) {
      await checkProfileConflict(userId, { email: data.email, phone: data.phone });
    }

    const providerUpdate: Record<string, any> = {};
    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      providerUpdate.name = trimmedName;
      const parts = trimmedName.split(' ').filter(Boolean);
      providerUpdate.initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : trimmedName.substring(0, 2).toUpperCase();
    }
    if (data.phone !== undefined) providerUpdate.phone = data.phone.trim();
    if (data.email !== undefined) providerUpdate.email = data.email.toLowerCase().trim();
    if (data.address !== undefined) providerUpdate.address = data.address.trim();
    if (data.bio !== undefined) providerUpdate.bio = data.bio.trim();
    if (Array.isArray(data.languages)) providerUpdate.languages = data.languages;
    if (data.bank && typeof data.bank === 'object') {
      providerUpdate.bank = {
        bankName: data.bank.bankName || '',
        ifscCode: data.bank.ifscCode || '',
        accountHolderName: data.bank.accountHolderName || '',
      };
    }

    const provider = await Provider.findOneAndUpdate(
      { userId },
      { $set: providerUpdate },
      { new: true, runValidators: true }
    );
    if (!provider) throw new AppError('Provider profile not found', 404);

    // Synchronize common attributes to the User record
    const userUpdate: Record<string, any> = {};
    if (data.name !== undefined) userUpdate.name = data.name.trim();
    if (data.phone !== undefined) userUpdate.phone = data.phone.trim();
    if (data.email !== undefined) userUpdate.email = data.email.toLowerCase().trim();
    if (data.address !== undefined) userUpdate.location = data.address.trim();

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: userUpdate });
    }

    return provider;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update provider profile', 500);
  }
}

export async function getProviderStats(userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalBookings = await Booking.countDocuments({ providerId: provider._id });
    const todayJobs = await Booking.countDocuments({
      providerId: provider._id,
      scheduledAt: { $gte: today },
    });
    const completedJobs = await Booking.countDocuments({
      providerId: provider._id,
      status: 'completed',
    });

    return {
      todayJobs,
      monthEarnings: provider.totalEarned,
      avgRating: provider.rating,
      completionRate: provider.completionRate,
      jobsDone: provider.jobsDone,
      monthGrowth: 18,
      totalBookings,
      completedJobs,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get provider stats', 500);
  }
}

export async function getProviderBookings(userId: string, filter?: string) {
  try {
    return bookingService.getProviderBookings(userId, filter);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get provider bookings', 500);
  }
}

export async function getBookingDetail(bookingId: string) {
  try {
    return bookingService.getBookingDetail(bookingId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get booking detail', 500);
  }
}

export async function acceptBooking(bookingId: string, userId: string) {
  try {
    const booking = await bookingService.acceptBooking(bookingId, userId);

    await notificationService.notifyBookingAccepted(
      bookingId,
      booking.providerName,
      booking.consumerId.toString()
    );

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to accept booking', 500);
  }
}

export async function declineBooking(bookingId: string, userId: string) {
  try {
    const booking = await bookingService.declineBooking(bookingId, userId);

    await notificationService.notifyBookingCancelled(
      bookingId,
      'provider',
      booking.consumerId.toString()
    );

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to decline booking', 500);
  }
}

export async function updateJobStatus(
  bookingId: string,
  userId: string,
  status: 'arrived' | 'started' | 'completed' | 'done'
) {
  try {
    const booking = await bookingService.updateJobStatus(bookingId, userId, status);

    if (status === 'completed' || status === 'done') {
      await notificationService.notifyBookingCompleted(
        bookingId,
        booking.providerName,
        booking.consumerId.toString()
      );
    }

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update job status', 500);
  }
}

export async function uploadPhotos(bookingId: string, userId: string, photoUrls: string[]) {
  try {
    return bookingService.uploadPhotos(bookingId, userId, photoUrls);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to upload photos', 500);
  }
}

export async function getEarnings(userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const completedBookings = await Booking.find({
      providerId: provider._id,
      status: 'completed',
    }).lean();

    const monthlyEarnings = completedBookings.reduce(
      (sum, b) => sum + b.totalAmount,
      0
    );

    return {
      totalEarned: provider.totalEarned,
      monthlyEarnings,
      jobsDone: provider.jobsDone,
      averagePerJob:
        provider.jobsDone > 0
          ? Math.round(provider.totalEarned / provider.jobsDone)
          : 0,
      bookings: completedBookings.map((b) => ({
        id: b._id,
        date: b.date,
        serviceName: b.serviceName,
        amount: b.totalAmount,
      })),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get earnings', 500);
  }
}

export async function toggleAvailability(userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    provider.isAvailable = !provider.isAvailable;
    await provider.save();

    return provider;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to toggle availability', 500);
  }
}

export async function rateCustomer(bookingId: string, userId: string, rating: number) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    booking.customerRating = rating;
    await booking.save();

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to rate customer', 500);
  }
}

export async function getNewBookingRequests(userId: string) {
  try {
    return bookingService.getNewBookingRequests(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get new booking requests', 500);
  }
}

export async function generateBookingOtp(bookingId: string, userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.providerId?.toString() !== provider._id.toString()) {
      throw new AppError('Not authorized to generate OTP for this booking', 403);
    }

    const otp = await bookingService.generateOTP(bookingId);
    return { otp };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to generate booking OTP', 500);
  }
}

// ── Provider Service CRUD ──────────────────────────────────────────────────

export async function getProviderServices(userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    return Service.find({
      $or: [
        { providerUserId: provider._id },
        { providerUserId: provider.userId },
      ],
    }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get provider services', 500);
  }
}

export async function createProviderService(userId: string, data: any) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    let categoryLabel = data.categoryLabel;
    let accentColor = data.accentColor;
    let accentBg = data.accentBg;

    // Auto-resolve categoryLabel, accentColor, accentBg from ServiceCategory if missing
    if (!categoryLabel || !accentColor || !accentBg) {
      if (data.categoryId) {
        const category = await ServiceCategory.findById(data.categoryId);
        if (category) {
          if (!categoryLabel) categoryLabel = category.name;
          if (!accentColor) accentColor = category.color;
          if (!accentBg) accentBg = category.bg;
        }
      }
    }

    categoryLabel = categoryLabel || 'General';
    accentColor = accentColor || '#6366F1';
    accentBg = accentBg || '#EEF2FF';

    const service = await Service.create({
      ...data,
      provider: provider.name,
      providerInitials: provider.initials,
      providerUserId: provider._id,
      categoryLabel,
      accentColor,
      accentBg,
      verified: false,
      jobCount: 0,
      reviews: 0,
      rating: 0,
      images: [],
    });

    return service;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error?.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e: any) => e.message).join(', ');
      throw new AppError(`Validation failed: ${messages || error.message}`, 422);
    }
    throw new AppError(error?.message || 'Failed to create provider service', 500);
  }
}

export async function updateProviderService(userId: string, serviceId: string, data: any) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const service = await Service.findOneAndUpdate(
      {
        _id: serviceId,
        $or: [
          { providerUserId: provider._id },
          { providerUserId: provider.userId },
        ],
      },
      { $set: data },
      { new: true }
    );
    if (!service) throw new AppError('Service not found or not authorized', 404);

    return service;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update provider service', 500);
  }
}

export async function deactivateService(userId: string, serviceId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const service = await Service.findOneAndUpdate(
      {
        _id: serviceId,
        $or: [
          { providerUserId: provider._id },
          { providerUserId: provider.userId },
        ],
      },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!service) throw new AppError('Service not found or not authorized', 404);

    return { message: 'Service deactivated' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to deactivate service', 500);
  }
}

export async function createVariation(userId: string, serviceId: string, data: any) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const service = await Service.findOne({
      _id: serviceId,
      $or: [
        { providerUserId: provider._id },
        { providerUserId: provider.userId },
      ],
    });
    if (!service) throw new AppError('Service not found or not authorized', 404);

    return ServiceVariation.create({ ...data, serviceId });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error?.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e: any) => e.message).join(', ');
      throw new AppError(`Validation failed: ${messages || error.message}`, 422);
    }
    throw new AppError(error?.message || 'Failed to create variation', 500);
  }
}

export async function getCatalog(query: { categoryId?: string; category?: string }) {
  try {
    const filter: any = { isActive: true };
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    } else if (query.category && query.category !== 'all') {
      const cat = await ServiceCategory.findOne({
        name: { $regex: query.category, $options: 'i' },
      });
      if (cat) filter.categoryId = cat._id;
    }
    return ServiceCatalog.find(filter).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch catalog', 500);
  }
}

export async function updateVariation(userId: string, variationId: string, data: any) {
  try {
    const variation = await ServiceVariation.findById(variationId);
    if (!variation) throw new AppError('Variation not found', 404);

    const service = await Service.findById(variation.serviceId);
    if (!service) throw new AppError('Service not found', 404);

    const provider = await Provider.findOne({ userId });
    if (!provider || service.providerUserId?.toString() !== provider._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    return ServiceVariation.findByIdAndUpdate(
      variationId,
      { $set: data },
      { new: true }
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update variation', 500);
  }
}

export async function deleteVariation(userId: string, variationId: string) {
  try {
    const variation = await ServiceVariation.findById(variationId);
    if (!variation) throw new AppError('Variation not found', 404);

    const service = await Service.findById(variation.serviceId);
    if (!service) throw new AppError('Service not found', 404);

    const provider = await Provider.findOne({ userId });
    if (!provider || service.providerUserId?.toString() !== provider._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    await variation.deleteOne();
    return { message: 'Variation deleted' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete variation', 500);
  }
}

// ── Provider Notifications ─────────────────────────────────────────────────

export async function getProviderNotifications(userId: string, page = 1, limit = 20) {
  try {
    return notificationService.getNotifications(userId, page, limit);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get provider notifications', 500);
  }
}

export async function markProviderNotificationRead(userId: string, notificationId: string) {
  try {
    return notificationService.markNotificationRead(userId, notificationId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to mark notification read', 500);
  }
}

// ── Provider Reviews ────────────────────────────────────────────────────────

export async function getProviderReviews(userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    return Review.find({ providerId: provider._id })
      .populate('consumerId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get provider reviews', 500);
  }
}
