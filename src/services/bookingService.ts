import mongoose from 'mongoose';
import { Booking, Provider, User, Service, ServiceVariation } from '../models';
import { AppError } from '../middleware/errorHandler';
import { generateBookingRef, generateRequestNo } from '../utils/generateBookingRef';

type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
type ProviderBookingStatus = 'new' | 'active' | 'pending' | 'done' | 'cancelled';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  upcoming: ['ongoing', 'cancelled'],
  ongoing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const VALID_PROVIDER_TRANSITIONS: Record<ProviderBookingStatus, ProviderBookingStatus[]> = {
  new: ['active', 'cancelled'],
  active: ['pending', 'done', 'cancelled'],
  pending: ['done', 'cancelled'],
  done: [],
  cancelled: [],
};

export async function checkSlotConflict(
  providerId: string,
  scheduledAt: Date,
  durationMins: number,
  excludeBookingId?: string
): Promise<boolean> {
  try {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);

    const filter: Record<string, unknown> = {
      providerId,
      status: { $in: ['upcoming', 'ongoing'] as BookingStatus[] },
      scheduledAt: { $lt: endTime },
    };

    if (excludeBookingId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
    }

    const conflicting = await Booking.findOne(filter).lean();

    if (conflicting) {
      const existingEnd = new Date(
        new Date(conflicting.scheduledAt).getTime() + (conflicting.durationMins || 60) * 60 * 1000
      );
      if (existingEnd > startTime) {
        return true;
      }
    }

    return false;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to check slot conflict', 500);
  }
}

export function validateStatusTransition(
  current: BookingStatus,
  next: BookingStatus
): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new AppError(
      `Cannot transition booking from '${current}' to '${next}'`,
      400
    );
  }
}

export function validateProviderStatusTransition(
  current: ProviderBookingStatus,
  next: ProviderBookingStatus
): void {
  const allowed = VALID_PROVIDER_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new AppError(
      `Cannot transition provider status from '${current}' to '${next}'`,
      400
    );
  }
}

export async function generateOTP(bookingId: string): Promise<string> {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.otp = otp;
    booking.otpVerified = false;
    await booking.save();

    return otp;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to generate OTP', 500);
  }
}

export async function verifyOTP(
  bookingId: string,
  otp: string,
  userId: string,
  role: 'consumer' | 'provider'
) {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (role === 'consumer' && booking.consumerId.toString() !== userId) {
      throw new AppError('Not authorized', 403);
    }
    if (role === 'provider') {
      const provider = await Provider.findOne({ userId });
      if (!provider || booking.providerId?.toString() !== provider._id.toString()) {
        throw new AppError('Not authorized', 403);
      }
    }

    if (!booking.otp) throw new AppError('No OTP generated for this booking', 400);
    if (booking.otpVerified) throw new AppError('OTP already verified', 400);
    if (booking.otp !== otp) throw new AppError('Invalid OTP', 400);

    booking.otpVerified = true;
    booking.otp = undefined;

    validateStatusTransition(booking.status, 'ongoing');
    booking.status = 'ongoing';

    if (booking.steps && booking.steps.length >= 2) {
      booking.steps[1].state = 'done';
      booking.steps[1].timestamp = new Date();
      if (booking.steps.length >= 3) {
        booking.steps[2].state = 'current';
      }
    }

    await booking.save();
    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to verify OTP', 500);
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
    const service = await Service.findById(data.serviceId);
    if (!service) throw new AppError('Service not found', 404);

    let price = service.price;
    let variantId;

    if (data.variationId) {
      const variation = await ServiceVariation.findById(data.variationId);
      if (variation && variation.serviceId.toString() === data.serviceId) {
        price = variation.price;
        variantId = variation._id;
      }
    }

    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new AppError('Invalid scheduled date', 400);
    }

    const dateStr = scheduledDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const timeStr = scheduledDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const durationMins = 60;

    // Resolve provider from service.providerUserId (supports User or Provider ID) or business name
    let provider = null;
    if (service.providerUserId) {
      provider = await Provider.findOne({
        $or: [
          { _id: service.providerUserId },
          { userId: service.providerUserId },
        ],
      });
    }
    if (!provider && service.provider) {
      provider = await Provider.findOne({ name: service.provider });
    }
    if (!provider) {
      provider = await Provider.findOne({
        $or: [
          { category: service.categoryLabel },
          { serviceCategories: service.categoryLabel },
        ],
      });
    }
    if (!provider) {
      provider = await Provider.findOne();
    }

    const providerName = provider?.name || service.provider;
    const providerInitials = provider?.initials || service.providerInitials;

    const booking = await Booking.create({
      consumerId: userId,
      providerId: provider?._id,
      requestNo: await generateRequestNo(),
      customer: {
        name: user.name,
        initials: user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        rating: user.tier === 'Platinum' ? 5.0 : user.tier === 'Gold' ? 4.8 : 4.5,
        totalOrders: user.bookingsCount || 1,
        phone: user.phone || '9876543210',
      },
      status: 'upcoming',
      providerStatus: 'new',
      serviceType: service.categoryLabel,
      serviceVariantId: variantId,
      serviceName: service.name,
      services: [{ name: service.name, quantity: 1, price }],
      location: {
        address: data.address,
        city: data.city || '',
        distanceKm: 2.5,
        etaMins: 15,
      },
      scheduledAt: scheduledDate,
      durationMins,
      timeSlot: `${timeStr} – ${new Date(
        scheduledDate.getTime() + durationMins * 60 * 1000
      ).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      address: data.address,
      payment: 'prepaid',
      totalAmount: price,
      price,
      isPaid: false,
      bookingRef: await generateBookingRef(),
      mcIcon: service.mcIcon,
      color: service.accentColor,
      bg: service.accentBg,
      accentColor: service.accentColor,
      category: service.categoryLabel,
      canReschedule: true,
      canCancel: true,
      canReview: false,
      canTrack: false,
      proAvatar: providerInitials,
      providerName,
      initials: providerInitials,
      date: dateStr,
      time: timeStr,
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed.', state: 'done' },
        { label: 'Professional En Route', detail: 'Professional is on the way.', state: 'pending' },
        { label: 'Service In Progress', detail: 'Service has started.', state: 'pending' },
        { label: 'Service Completed', detail: 'Service has been completed.', state: 'pending' },
        { label: 'Payment Processed', detail: 'Payment has been processed.', state: 'pending' },
      ],
      photos: [],
      otpVerified: false,
    });

    user.bookingsCount += 1;
    await user.save();

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create booking', 500);
  }
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  role: 'consumer' | 'provider',
  reason?: string
) {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (role === 'consumer' && booking.consumerId.toString() !== userId) {
      throw new AppError('Not authorized', 403);
    }
    if (role === 'provider') {
      const provider = await Provider.findOne({ userId });
      if (!provider || booking.providerId?.toString() !== provider._id.toString()) {
        throw new AppError('Not authorized', 403);
      }
    }

    validateStatusTransition(booking.status, 'cancelled');
    validateProviderStatusTransition(booking.providerStatus, 'cancelled');

    booking.status = 'cancelled';
    booking.providerStatus = 'cancelled';
    booking.canCancel = false;
    booking.canReschedule = false;
    booking.cancelledAt = new Date();
    if (reason) booking.cancelReason = reason;
    await booking.save();

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to cancel booking', 500);
  }
}

export async function rescheduleBooking(
  bookingId: string,
  userId: string,
  newScheduledAt: string
) {
  try {
    const booking = await Booking.findOne({ _id: bookingId, consumerId: userId });
    if (!booking) throw new AppError('Booking not found', 404);
    if (!booking.canReschedule) throw new AppError('Booking cannot be rescheduled', 400);

    const newDate = new Date(newScheduledAt);
    if (isNaN(newDate.getTime())) {
      throw new AppError('Invalid date', 400);
    }

    if (newDate <= new Date()) {
      throw new AppError('Cannot reschedule to a past time', 400);
    }

    const dateStr = newDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const timeStr = newDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    booking.scheduledAt = newDate;
    booking.date = dateStr;
    booking.time = timeStr;
    booking.timeSlot = `${timeStr} – ${new Date(
      newDate.getTime() + (booking.durationMins || 60) * 60 * 1000
    ).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    await booking.save();

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to reschedule booking', 500);
  }
}

export async function updateJobStatus(
  bookingId: string,
  userId: string,
  status: 'arrived' | 'started' | 'completed' | 'done'
) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.providerId?.toString() !== provider._id.toString()) {
      throw new AppError('Not authorized to update this booking', 403);
    }

    switch (status) {
      case 'arrived':
        if (booking.steps && booking.steps.length >= 1) {
          booking.steps[0].state = 'done';
          booking.steps[0].detail = 'Checked in at location';
          booking.steps[0].timestamp = new Date();
        }
        break;

      case 'started':
        if (booking.steps && booking.steps.length >= 3) {
          booking.steps[1].state = 'done';
          booking.steps[1].timestamp = new Date();
          booking.steps[2].state = 'current';
        }
        break;

      case 'completed':
      case 'done':
        validateStatusTransition(booking.status, 'completed');
        validateProviderStatusTransition(booking.providerStatus, 'done');

        booking.status = 'completed';
        booking.providerStatus = 'done';
        booking.canReview = true;
        booking.canTrack = false;

        if (booking.steps && booking.steps.length >= 4) {
          booking.steps[2].state = 'done';
          booking.steps[2].timestamp = new Date();
          booking.steps[3].state = 'done';
          booking.steps[3].timestamp = new Date();
        }

        provider.jobsDone += 1;
        provider.totalEarned += booking.totalAmount;

        if (provider.reviewCount > 0) {
          // Rating stays the same, just increment jobs
        } else {
          provider.rating = 0;
        }
        await provider.save();
        break;
    }

    await booking.save();
    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update job status', 500);
  }
}

export async function acceptBooking(bookingId: string, userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.providerStatus !== 'new') {
      throw new AppError('Booking has already been processed', 400);
    }

    validateProviderStatusTransition(booking.providerStatus, 'active');

    booking.providerId = provider._id;
    booking.providerStatus = 'active';
    booking.status = 'ongoing';
    booking.canTrack = true;
    booking.providerName = provider.name;
    booking.proAvatar = provider.initials;
    booking.steps = [
      { label: 'Arrived at location', detail: 'Professional has arrived', state: 'pending' },
      { label: 'OTP verified', detail: 'Customer identity confirmed', state: 'pending' },
      { label: 'Service underway', detail: 'Service in progress', state: 'current' },
      { label: 'Upload before/after photos', detail: 'Required for completion', state: 'pending' },
    ];
    await booking.save();

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to accept booking', 500);
  }
}

export async function declineBooking(bookingId: string, userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    validateStatusTransition(booking.status, 'cancelled');
    validateProviderStatusTransition(booking.providerStatus, 'cancelled');

    booking.status = 'cancelled';
    booking.providerStatus = 'cancelled';
    booking.canCancel = false;
    booking.canReschedule = false;
    booking.cancelledAt = new Date();
    await booking.save();

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to decline booking', 500);
  }
}

export async function getBookingDetail(bookingId: string) {
  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw new AppError('Booking not found', 404);
    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get booking detail', 500);
  }
}

export async function getConsumerBookings(userId: string, status?: string) {
  try {
    const filter: Record<string, unknown> = { consumerId: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    return Booking.find(filter).sort({ createdAt: -1, scheduledAt: -1 }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get consumer bookings', 500);
  }
}

export async function getProviderBookings(userId: string, filter?: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    let query: Record<string, unknown> = { providerId: provider._id };

    if (filter) {
      switch (filter) {
        case 'Today': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          query.scheduledAt = { $gte: today };
          break;
        }
        case 'Pending':
          query.providerStatus = { $in: ['new', 'pending'] };
          break;
        case 'Completed':
          query.providerStatus = 'done';
          break;
        case 'Cancelled':
          query.providerStatus = 'cancelled';
          break;
      }
    }

    return Booking.find(query).sort({ createdAt: -1, scheduledAt: -1 }).lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get provider bookings', 500);
  }
}

export async function getNewBookingRequests(userId: string) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    return Booking.find({ providerId: provider._id, providerStatus: 'new' })
      .sort({ createdAt: -1, scheduledAt: 1 })
      .limit(10)
      .lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get new booking requests', 500);
  }
}

export async function uploadPhotos(
  bookingId: string,
  userId: string,
  photoUrls: string[]
) {
  try {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new AppError('Provider profile not found', 404);

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.providerId?.toString() !== provider._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    booking.photos = [...booking.photos, ...photoUrls];
    await booking.save();

    return booking;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to upload photos', 500);
  }
}
