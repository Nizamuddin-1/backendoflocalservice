import {
  Provider, Booking, User, Service, ServiceVariation, Notification, Review,
} from '../models';
import { AppError } from '../middleware/errorHandler';

export async function getProviderProfile(userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);
  return provider;
}

export async function updateProviderProfile(userId: string, data: any) {
  const provider = await Provider.findOneAndUpdate({ userId }, { $set: data }, { new: true });
  if (!provider) throw new AppError('Provider profile not found', 404);
  return provider;
}

export async function getProviderStats(userId: string) {
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
}

export async function getProviderBookings(userId: string, filter?: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  let query: Record<string, unknown> = { providerId: provider._id };

  if (filter) {
    switch (filter) {
      case 'Today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query.scheduledAt = { $gte: today };
        break;
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

  return Booking.find(query).sort({ scheduledAt: -1 }).lean();
}

export async function getBookingDetail(bookingId: string) {
  const booking = await Booking.findById(bookingId).lean();
  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
}

export async function acceptBooking(bookingId: string, userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.providerStatus !== 'new') {
    throw new AppError('Booking has already been processed', 400);
  }

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

  await Notification.create({
    userId: booking.consumerId,
    type: 'booking_status',
    title: 'Booking Accepted',
    body: `${provider.name} has accepted your booking`,
    data: { bookingId: booking._id },
  });

  return booking;
}

export async function declineBooking(bookingId: string, userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  booking.providerStatus = 'cancelled';
  await booking.save();

  return booking;
}

export async function updateJobStatus(
  bookingId: string,
  userId: string,
  status: 'arrived' | 'started' | 'completed'
) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.providerId?.toString() !== provider._id.toString()) {
    throw new AppError('Not authorized to update this booking', 403);
  }

  switch (status) {
    case 'arrived':
      booking.steps[0].state = 'done';
      booking.steps[0].detail = 'Checked in at location';
      booking.steps[0].timestamp = new Date();
      break;
    case 'started':
      booking.steps[1].state = 'done';
      booking.steps[2].state = 'current';
      break;
    case 'completed':
      booking.status = 'completed';
      booking.providerStatus = 'done';
      booking.canReview = true;
      booking.canTrack = false;
      booking.steps[2].state = 'done';
      booking.steps[3].state = 'done';

      provider.jobsDone += 1;
      provider.totalEarned += booking.totalAmount;
      await provider.save();

      await Notification.create({
        userId: booking.consumerId,
        type: 'booking_status',
        title: 'Service Completed',
        body: `${provider.name} has completed the service`,
        data: { bookingId: booking._id },
      });
      break;
  }

  await booking.save();
  return booking;
}

export async function uploadPhotos(bookingId: string, userId: string, photoUrls: string[]) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  booking.photos = [...booking.photos, ...photoUrls];
  await booking.save();

  return booking;
}

export async function getEarnings(userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const completedBookings = await Booking.find({
    providerId: provider._id,
    status: 'completed',
  }).lean();

  const monthlyEarnings = completedBookings.reduce((s, b) => s + b.totalAmount, 0);

  return {
    totalEarned: provider.totalEarned,
    monthlyEarnings,
    jobsDone: provider.jobsDone,
    averagePerJob: provider.jobsDone > 0 ? Math.round(provider.totalEarned / provider.jobsDone) : 0,
    bookings: completedBookings.map((b) => ({
      id: b._id,
      date: b.date,
      serviceName: b.serviceName,
      amount: b.totalAmount,
    })),
  };
}

export async function toggleAvailability(userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  provider.isAvailable = !provider.isAvailable;
  await provider.save();

  return provider;
}

export async function rateCustomer(bookingId: string, userId: string, rating: number) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  booking.customerRating = rating;
  await booking.save();

  if (rating > 0) {
    provider.reviewCount += 1;
    provider.rating = ((provider.rating * (provider.reviewCount - 1)) + rating) / provider.reviewCount;
    await provider.save();
  }

  return booking;
}

export async function getNewBookingRequests(userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  return Booking.find({ providerStatus: 'new' })
    .sort({ scheduledAt: 1 })
    .limit(10)
    .lean();
}

export async function generateBookingOtp(bookingId: string, userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.providerId?.toString() !== provider._id.toString()) {
    throw new AppError('Not authorized to generate OTP for this booking', 403);
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  booking.otp = otp;
  booking.otpVerified = false;
  await booking.save();

  return { otp };
}

// ── Provider Service CRUD ──────────────────────────────────────────────────

export async function getProviderServices(userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  return Service.find({ providerUserId: provider._id }).lean();
}

export async function createProviderService(userId: string, data: any) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const service = await Service.create({
    ...data,
    provider: provider.name,
    providerInitials: provider.initials,
    providerUserId: provider._id,
    categoryLabel: data.categoryLabel || '',
    verified: false,
    jobCount: 0,
    reviews: 0,
    rating: 0,
    images: [],
  });

  return service;
}

export async function updateProviderService(userId: string, serviceId: string, data: any) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const service = await Service.findOneAndUpdate(
    { _id: serviceId, providerUserId: provider._id },
    { $set: data },
    { new: true }
  );
  if (!service) throw new AppError('Service not found or not authorized', 404);

  return service;
}

export async function deactivateService(userId: string, serviceId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const service = await Service.findOneAndUpdate(
    { _id: serviceId, providerUserId: provider._id },
    { $set: { isActive: false } },
    { new: true }
  );
  if (!service) throw new AppError('Service not found or not authorized', 404);

  return { message: 'Service deactivated' };
}

export async function createVariation(userId: string, serviceId: string, data: any) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  const service = await Service.findOne({ _id: serviceId, providerUserId: provider._id });
  if (!service) throw new AppError('Service not found or not authorized', 404);

  return ServiceVariation.create({ ...data, serviceId });
}

export async function updateVariation(userId: string, variationId: string, data: any) {
  const variation = await ServiceVariation.findById(variationId);
  if (!variation) throw new AppError('Variation not found', 404);

  const service = await Service.findById(variation.serviceId);
  if (!service) throw new AppError('Service not found', 404);

  const provider = await Provider.findOne({ userId });
  if (!provider || service.providerUserId?.toString() !== provider._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  return ServiceVariation.findByIdAndUpdate(variationId, { $set: data }, { new: true });
}

export async function deleteVariation(userId: string, variationId: string) {
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
}

// ── Provider Notifications ─────────────────────────────────────────────────

export async function getProviderNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId }),
  ]);
  return { notifications, total, page, totalPages: Math.ceil(total / limit) };
}

export async function markProviderNotificationRead(userId: string, notificationId: string) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);
  return notification;
}

// ── Provider Reviews ────────────────────────────────────────────────────────

export async function getProviderReviews(userId: string) {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new AppError('Provider profile not found', 404);

  return Review.find({ providerId: provider._id })
    .populate('consumerId', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();
}
