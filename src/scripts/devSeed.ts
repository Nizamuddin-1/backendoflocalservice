import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import {
  User, Provider, ServiceCategory, Service, ServiceVariation, Booking, Review,
} from '../models';

async function seedDev() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Refusing to run dev seed script in production environment!');
    process.exit(1);
  }

  const isReset = process.argv.includes('--reset');

  console.log(`Connecting to MongoDB at ${env.mongodbUri}...`);
  await mongoose.connect(env.mongodbUri);
  console.log('✓ Connected to MongoDB');

  const consumerEmail = 'nizamuddin@test.com';
  const providerEmail = 'shamsuddin@test.com';
  const plainPassword = 'Test@1234';

  if (isReset) {
    console.log('\n--- Reset mode: Cleaning up existing seeded test records ---');
    const existingConsumer = await User.findOne({ email: consumerEmail });
    const existingProviderUser = await User.findOne({ email: providerEmail });

    if (existingProviderUser) {
      const existingProvider = await Provider.findOne({ userId: existingProviderUser._id });
      if (existingProvider) {
        const services = await Service.find({ providerUserId: existingProvider._id });
        const serviceIds = services.map((s) => s._id);
        await ServiceVariation.deleteMany({ serviceId: { $in: serviceIds } });
        await Service.deleteMany({ providerUserId: existingProvider._id });
        await Review.deleteMany({ providerId: existingProvider._id });
        await Booking.deleteMany({ providerId: existingProvider._id });
        await Provider.deleteOne({ _id: existingProvider._id });
      }
      await User.deleteOne({ _id: existingProviderUser._id });
    }

    if (existingConsumer) {
      await Booking.deleteMany({ consumerId: existingConsumer._id });
      await Review.deleteMany({ consumerId: existingConsumer._id });
      await User.deleteOne({ _id: existingConsumer._id });
    }
    console.log('✓ Cleanup complete');
  }

  console.log('\n--- Seeding Test Users ---');
  // Pass plainPassword directly to User model so Mongoose pre('save') hook hashes it once with 12 rounds
  // 1. Consumer: Nizamuddin
  let consumer = await User.findOne({ email: consumerEmail });
  if (!consumer) {
    consumer = await User.create({
      name: 'Nizamuddin',
      email: consumerEmail,
      phone: '+919876543299',
      password: plainPassword,
      role: 'consumer',
      location: 'Koramangala, Bengaluru',
      tier: 'Gold',
      loyaltyPoints: 350,
      totalSpent: 4899,
      bookingsCount: 3,
      isAvailable: true,
      isPhoneVerified: true,
    });
    console.log(`✓ Created consumer: ${consumer.name} (${consumer.email})`);
  } else {
    consumer.name = 'Nizamuddin';
    consumer.password = plainPassword;
    consumer.phone = '+919876543299';
    consumer.role = 'consumer';
    consumer.location = 'Koramangala, Bengaluru';
    await consumer.save();
    console.log(`✓ Updated existing consumer: ${consumer.name} (${consumer.email})`);
  }

  // 2. Provider: Shamsuddin
  let providerUser = await User.findOne({ email: providerEmail });
  if (!providerUser) {
    providerUser = await User.create({
      name: 'Shamsuddin',
      email: providerEmail,
      phone: '+919876543288',
      password: plainPassword,
      role: 'provider',
      location: 'Indiranagar, Bengaluru',
      tier: 'Platinum',
      isAvailable: true,
      isPhoneVerified: true,
    });
    console.log(`✓ Created provider user: ${providerUser.name} (${providerUser.email})`);
  } else {
    providerUser.name = 'Shamsuddin';
    providerUser.password = plainPassword;
    providerUser.phone = '+919876543288';
    providerUser.role = 'provider';
    await providerUser.save();
    console.log(`✓ Updated existing provider user: ${providerUser.name} (${providerUser.email})`);
  }

  // 3. Provider Profile
  let providerProfile = await Provider.findOne({ userId: providerUser._id });
  if (!providerProfile) {
    providerProfile = await Provider.create({
      userId: providerUser._id,
      name: 'Shamsuddin Services',
      initials: 'SS',
      category: 'Home Maintenance',
      serviceCategories: ['Home Cleaning', 'AC Repair', 'Plumbing', 'Electrical'],
      rating: 4.9,
      reviewCount: 38,
      jobsDone: 112,
      completionRate: 98,
      totalEarned: 74500,
      isAvailable: true,
      phone: '+919876543288',
      email: providerEmail,
      address: '12, 100 Feet Rd, Indiranagar, Bengaluru',
      bio: 'Certified professional with 8+ years experience in home cleaning, AC repair, and maintenance.',
      languages: ['English', 'Hindi', 'Kannada'],
      bank: {
        bankName: 'HDFC Bank',
        maskedNo: '6541',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Shamsuddin',
        verified: true,
      },
      documents: [
        { type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' },
        { type: 'experience', label: '8 Yrs Certification', status: 'verified', url: '' },
        { type: 'background', label: 'Police Verification', status: 'verified', url: '' },
      ],
    });
    console.log(`✓ Created provider profile: ${providerProfile.name} (SS)`);
  } else {
    providerProfile.name = 'Shamsuddin Services';
    providerProfile.initials = 'SS';
    providerProfile.isAvailable = true;
    providerProfile.serviceCategories = ['Home Cleaning', 'AC Repair', 'Plumbing', 'Electrical'];
    await providerProfile.save();
    console.log(`✓ Updated provider profile: ${providerProfile.name} (SS)`);
  }

  // 4. Categories
  console.log('\n--- Seeding Service Categories ---');
  const categoryDefs = [
    { name: 'Home Cleaning', icon: 'broom', color: '#0EA5E9', bg: '#E0F2FE' },
    { name: 'AC Repair', icon: 'air-conditioner', color: '#6366F1', bg: '#EEF2FF' },
    { name: 'Plumbing', icon: 'pipe-wrench', color: '#10B981', bg: '#ECFDF5' },
    { name: 'Electrical', icon: 'lightning-bolt', color: '#F59E0B', bg: '#FEF3C7' },
  ];

  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of categoryDefs) {
    let existing = await ServiceCategory.findOne({ name: cat.name });
    if (!existing) {
      existing = await ServiceCategory.create({ ...cat, proCount: 15, isActive: true });
    }
    categoryMap.set(cat.name, existing._id as mongoose.Types.ObjectId);
    console.log(`✓ Category ready: ${cat.name}`);
  }

  // 5. Services linked to Shamsuddin
  console.log('\n--- Seeding Services ---');
  const serviceDefs = [
    {
      name: 'Deep Home Cleaning',
      category: 'Home Cleaning',
      price: 1499,
      originalPrice: 1999,
      eta: '2-3 hrs',
      badge: 'Best Seller',
      mcIcon: 'spray-bottle',
      accentColor: '#0EA5E9',
      accentBg: '#E0F2FE',
      shortDesc: 'Complete deep cleaning of living room, kitchen, bathrooms, and bedrooms.',
      tags: ['Eco-friendly', 'Deep Clean', 'Top Rated'],
      variations: [
        { label: '1 BHK Deep Cleaning', desc: 'Ideal for 1 BHK apartment up to 600 sq ft', price: 1499, originalPrice: 1899, duration: '120 mins', mcIcon: 'home', popular: false },
        { label: '2 BHK Deep Cleaning', desc: 'Comprehensive clean for 2 BHK apartment', price: 2499, originalPrice: 2999, duration: '180 mins', mcIcon: 'home-city', popular: true },
        { label: '3 BHK Deep Cleaning', desc: 'Full premium deep clean for 3 BHK residence', price: 3499, originalPrice: 4299, duration: '240 mins', mcIcon: 'home-variant', popular: false },
      ],
    },
    {
      name: 'AC Jet Service & Repair',
      category: 'AC Repair',
      price: 899,
      originalPrice: 1199,
      eta: '45 mins',
      badge: 'Popular',
      mcIcon: 'air-conditioner',
      accentColor: '#6366F1',
      accentBg: '#EEF2FF',
      shortDesc: 'High-pressure foam jet cleaning, cooling check, and electrical diagnostic.',
      tags: ['Fast Cooling', 'Jet Wash', 'Warranty'],
      variations: [
        { label: 'Standard Foam Jet Service', desc: 'Indoor & outdoor high-pressure wash', price: 899, originalPrice: 1199, duration: '45 mins', mcIcon: 'fan', popular: true },
        { label: 'Gas Refill & Master Service', desc: 'Full gas leak repair and refrigerant top-up', price: 1899, originalPrice: 2499, duration: '75 mins', mcIcon: 'gauge', popular: false },
      ],
    },
    {
      name: 'Plumbing Repair & Leak Fixing',
      category: 'Plumbing',
      price: 499,
      originalPrice: 699,
      eta: '30 mins',
      badge: 'Express',
      mcIcon: 'pipe-wrench',
      accentColor: '#10B981',
      accentBg: '#ECFDF5',
      shortDesc: 'Tap repair, pipe leaks, drain blockages, and sanitaryware fitting.',
      tags: ['30 Min Arrival', 'Certified Plumber'],
      variations: [
        { label: 'Minor Leak Repair', desc: 'Fixing 1-2 leaking faucets or flush tank valves', price: 499, originalPrice: 699, duration: '30 mins', mcIcon: 'water-pump', popular: false },
        { label: 'Drain Blockage Removal', desc: 'Mechanical unclogging of kitchen or bathroom drain', price: 799, originalPrice: 999, duration: '60 mins', mcIcon: 'cup-water', popular: true },
        { label: 'Full Fixture Replacement', desc: 'Installation of taps, showers, and connection pipes', price: 1199, originalPrice: 1499, duration: '90 mins', mcIcon: 'wrench', popular: false },
      ],
    },
    {
      name: 'Complete Home Electrical Inspection',
      category: 'Electrical',
      price: 699,
      originalPrice: 899,
      eta: '45 mins',
      badge: 'Safety',
      mcIcon: 'lightning-bolt',
      accentColor: '#F59E0B',
      accentBg: '#FEF3C7',
      shortDesc: 'Switchboard checks, MCB breaker testing, short-circuit diagnostics, and repairs.',
      tags: ['Safety First', 'Certified'],
      variations: [
        { label: 'Switch & Socket Repair', desc: 'Repair/replace up to 4 electrical points', price: 399, originalPrice: 599, duration: '30 mins', mcIcon: 'power-socket-us', popular: false },
        { label: 'Heavy Appliance Wiring', desc: 'Wiring setup for Geyser, AC, or Inverter lines', price: 699, originalPrice: 899, duration: '60 mins', mcIcon: 'flash', popular: true },
      ],
    },
  ];

  const seededServices: any[] = [];
  for (const sDef of serviceDefs) {
    const categoryId = categoryMap.get(sDef.category)!;
    let service = await Service.findOne({ name: sDef.name, providerUserId: providerProfile._id });
    if (!service) {
      service = await Service.create({
        categoryId,
        name: sDef.name,
        provider: providerProfile.name,
        providerInitials: providerProfile.initials,
        providerUserId: providerProfile._id,
        categoryLabel: sDef.category,
        mcIcon: sDef.mcIcon,
        rating: 4.8,
        reviews: 24,
        price: sDef.price,
        originalPrice: sDef.originalPrice,
        badge: sDef.badge,
        tags: sDef.tags,
        eta: sDef.eta,
        verified: true,
        accentColor: sDef.accentColor,
        accentBg: sDef.accentBg,
        jobCount: 45,
        shortDesc: sDef.shortDesc,
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
        isActive: true,
      });
      console.log(`✓ Created service: ${service.name}`);
    } else {
      console.log(`✓ Service exists: ${service.name}`);
    }
    seededServices.push(service);

    // Variations
    for (const vDef of sDef.variations) {
      let variation = await ServiceVariation.findOne({ serviceId: service._id, label: vDef.label });
      if (!variation) {
        variation = await ServiceVariation.create({
          serviceId: service._id,
          label: vDef.label,
          desc: vDef.desc,
          price: vDef.price,
          originalPrice: vDef.originalPrice,
          popular: vDef.popular,
          mcIcon: vDef.mcIcon,
          duration: vDef.duration,
        });
        console.log(`    ↳ Variation: ${variation.label} (₹${variation.price})`);
      }
    }
  }

  // 6. Seed Bookings between Nizamuddin and Shamsuddin
  console.log('\n--- Seeding Bookings ---');
  const now = new Date();
  const sampleBookings = [
    {
      requestNo: 'REQ-1001',
      service: seededServices[0],
      status: 'upcoming' as const,
      providerStatus: 'new' as const,
      scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      timeSlot: '02:00 PM - 04:00 PM',
      totalAmount: 1499,
      isPaid: true,
      payment: 'upi' as const,
    },
    {
      requestNo: 'REQ-1002',
      service: seededServices[1],
      status: 'ongoing' as const,
      providerStatus: 'active' as const,
      scheduledAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      timeSlot: '11:00 AM - 12:00 PM',
      totalAmount: 899,
      isPaid: false,
      payment: 'cash' as const,
    },
    {
      requestNo: 'REQ-1003',
      service: seededServices[2],
      status: 'completed' as const,
      providerStatus: 'done' as const,
      scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      timeSlot: '04:00 PM - 05:00 PM',
      totalAmount: 499,
      isPaid: true,
      payment: 'wallet' as const,
    },
  ];

  let completedBookingId: mongoose.Types.ObjectId | null = null;
  for (const b of sampleBookings) {
    let booking = await Booking.findOne({ requestNo: b.requestNo });
    if (!booking) {
      booking = await Booking.create({
        consumerId: consumer._id,
        providerId: providerProfile._id,
        requestNo: b.requestNo,
        customer: {
          name: consumer.name,
          initials: 'NZ',
          rating: 4.9,
          totalOrders: 3,
          phone: consumer.phone,
        },
        status: b.status,
        providerStatus: b.providerStatus,
        serviceType: b.service.name,
        serviceName: b.service.name,
        services: [
          {
            name: b.service.name,
            quantity: 1,
            price: b.totalAmount,
          },
        ],
        location: {
          address: 'Flat 402, Green Glen Layout, Koramangala, Bengaluru',
          city: 'Bengaluru',
          distanceKm: 2.8,
          etaMins: 15,
        },
        scheduledAt: b.scheduledAt,
        durationMins: 60,
        timeSlot: b.timeSlot,
        address: 'Flat 402, Green Glen Layout, Koramangala, Bengaluru',
        payment: b.payment,
        totalAmount: b.totalAmount,
        price: b.totalAmount,
        isPaid: b.isPaid,
        bookingRef: b.requestNo,
        mcIcon: b.service.mcIcon,
        color: b.service.accentColor,
        bg: b.service.accentBg,
        accentColor: b.service.accentColor,
        category: b.service.categoryLabel,
        steps: [
          { label: 'Booking Confirmed', detail: 'Provider accepted your request', state: 'done' },
          { label: 'On The Way', detail: 'Provider is traveling to location', state: b.status === 'upcoming' ? 'pending' : 'done' },
          { label: 'Job Started', detail: 'Service inspection in progress', state: b.status === 'ongoing' ? 'current' : b.status === 'completed' ? 'done' : 'pending' },
          { label: 'Job Completed', detail: 'Quality check completed', state: b.status === 'completed' ? 'done' : 'pending' },
        ],
      });
      console.log(`✓ Created booking: ${booking.requestNo} (${booking.serviceName}) - status: ${booking.status}`);
    } else {
      console.log(`✓ Booking exists: ${booking.requestNo}`);
    }

    if (b.status === 'completed') {
      completedBookingId = booking._id as mongoose.Types.ObjectId;
    }
  }

  // 7. Seed Review for the completed booking
  if (completedBookingId) {
    const existingReview = await Review.findOne({ bookingId: completedBookingId });
    if (!existingReview) {
      await Review.create({
        bookingId: completedBookingId,
        consumerId: consumer._id,
        providerId: providerProfile._id,
        serviceId: seededServices[2]._id,
        rating: 5,
        title: 'Outstanding plumbing service!',
        comment: 'Shamsuddin arrived on time, was extremely polite, and fixed the kitchen leak within 30 minutes. Highly recommended!',
        photos: [],
        isVerified: true,
      });
      console.log('✓ Created 5-star review for completed booking');
    }
  }

  console.log('\n======================================================');
  console.log('🎉 DEV SEED COMPLETED SUCCESSFULLY');
  console.log('======================================================');
  console.log(`CONSUMER LOGIN:`);
  console.log(`  Email:    ${consumerEmail}`);
  console.log(`  Password: ${plainPassword}`);
  console.log(`  User ID:  ${consumer._id}`);
  console.log(`------------------------------------------------------`);
  console.log(`PROVIDER LOGIN:`);
  console.log(`  Email:    ${providerEmail}`);
  console.log(`  Password: ${plainPassword}`);
  console.log(`  User ID:  ${providerUser._id}`);
  console.log(`  Profile:  ${providerProfile.name} (${providerProfile._id})`);
  console.log(`------------------------------------------------------`);
  console.log(`CATALOG SUMMARY:`);
  console.log(`  Categories: ${categoryDefs.length}`);
  console.log(`  Services:   ${serviceDefs.length}`);
  console.log(`  Bookings:   ${sampleBookings.length} (pending/new, ongoing/active, completed/done)`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seedDev().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
