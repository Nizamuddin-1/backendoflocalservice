import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User, Provider, ServiceCategory, ServiceCatalog, Service, ServiceVariation, Booking, Wallet, Transaction, Review, Address, Promo, Offer } from '../models';
import { seedCatalog } from './seedCatalog';
import { env } from '../config/env';

const MONGO_URI = env.mongodbUri || 'mongodb://localhost:27017/localfix';

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('[Seed] Connected to', MONGO_URI);

  console.log('[Seed] Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Provider.deleteMany({}),
    ServiceCategory.deleteMany({}),
    ServiceCatalog.deleteMany({}),
    Service.deleteMany({}),
    ServiceVariation.deleteMany({}),
    Booking.deleteMany({}),
    Wallet.deleteMany({}),
    Transaction.deleteMany({}),
    Review.deleteMany({}),
    Address.deleteMany({}),
    Promo.deleteMany({}),
    Offer.deleteMany({}),
  ]);
  console.log('[Seed] Cleared all collections.');

  const passwordHash = await bcrypt.hash('password123', 12);

  console.log('[Seed] Creating consumers...');
  const consumers = await User.insertMany([
    {
      name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210',
      password: passwordHash, role: 'consumer', location: 'Koramangala, Bengaluru',
      tier: 'Gold', loyaltyPoints: 450, totalSpent: 12499, bookingsCount: 8,
      isPhoneVerified: true, referralCode: 'RAHUL2024',
    },
    {
      name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211',
      password: passwordHash, role: 'consumer', location: 'Andheri West, Mumbai',
      tier: 'Silver', loyaltyPoints: 120, totalSpent: 3999, bookingsCount: 3,
      isPhoneVerified: true, referralCode: 'PRIYA2024',
    },
    {
      name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212',
      password: passwordHash, role: 'consumer', location: 'Sector 62, Noida',
      tier: 'Platinum', loyaltyPoints: 1200, totalSpent: 34999, bookingsCount: 22,
      isPhoneVerified: true, referralCode: 'AMIT2024',
    },
    {
      name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9876543213',
      password: passwordHash, role: 'consumer', location: 'Banjara Hills, Hyderabad',
      tier: 'Gold', loyaltyPoints: 680, totalSpent: 18750, bookingsCount: 12,
      isPhoneVerified: true, referralCode: 'SNEHA2024',
    },
    {
      name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214',
      password: passwordHash, role: 'consumer', location: 'Civil Lines, Jaipur',
      tier: 'Silver', loyaltyPoints: 50, totalSpent: 1299, bookingsCount: 1,
      isPhoneVerified: true, referralCode: 'VIKRAM2024',
    },
  ]);

  console.log('[Seed] Creating provider users...');
  const providerUsers = await User.insertMany([
    {
      name: 'Rajesh Electricals', email: 'rajesh@provider.com', phone: '9988776610',
      password: passwordHash, role: 'provider', location: 'HSR Layout, Bengaluru',
      tier: 'Gold', loyaltyPoints: 800, isPhoneVerified: true, referralCode: 'RAJESH-P',
    },
    {
      name: 'AquaFit Plumbing', email: 'aquafit@provider.com', phone: '9988776611',
      password: passwordHash, role: 'provider', location: 'Whitefield, Bengaluru',
      tier: 'Silver', loyaltyPoints: 320, isPhoneVerified: true, referralCode: 'AQUAFIT-P',
    },
    {
      name: 'CoolBreeze AC Services', email: 'coolbreeze@provider.com', phone: '9988776612',
      password: passwordHash, role: 'provider', location: 'Indiranagar, Bengaluru',
      tier: 'Platinum', loyaltyPoints: 1500, isPhoneVerified: true, referralCode: 'COOLBRZ-P',
    },
    {
      name: 'SparkFix Electricals', email: 'sparkfix@provider.com', phone: '9988776613',
      password: passwordHash, role: 'provider', location: 'JP Nagar, Bengaluru',
      tier: 'Gold', loyaltyPoints: 650, isPhoneVerified: true, referralCode: 'SPARKFX-P',
    },
    {
      name: 'CleanPro Home Care', email: 'cleanpro@provider.com', phone: '9988776614',
      password: passwordHash, role: 'provider', location: 'BTM Layout, Bengaluru',
      tier: 'Silver', loyaltyPoints: 200, isPhoneVerified: true, referralCode: 'CLEANPR-P',
    },
    {
      name: 'WoodCraft Carpentry', email: 'woodcraft@provider.com', phone: '9988776615',
      password: passwordHash, role: 'provider', location: 'Jayanagar, Bengaluru',
      tier: 'Gold', loyaltyPoints: 400, isPhoneVerified: true, referralCode: 'WOODCRT-P',
    },
  ]);

  console.log('[Seed] Creating categories...');
  const categories = await ServiceCategory.insertMany([
    { name: 'AC & Cooling', icon: 'snow', color: '#1B4FD8', bg: '#E9EFFC', proCount: 22 },
    { name: 'Plumbing', icon: 'water', color: '#3D7A60', bg: '#E6F4EC', proCount: 17 },
    { name: 'Electrical', icon: 'flash', color: '#B07D2E', bg: '#FBF0D6', proCount: 31 },
    { name: 'Cleaning', icon: 'sparkles', color: '#6B3FA0', bg: '#F0EAFA', proCount: 14 },
    { name: 'Painting', icon: 'color-palette', color: '#C0522B', bg: '#FDF1EC', proCount: 9 },
    { name: 'Carpentry', icon: 'hammer', color: '#A83E20', bg: '#FAEAE4', proCount: 11 },
    { name: 'Pest Control', icon: 'shield-checkmark', color: '#0D9488', bg: '#CCFBF1', proCount: 8 },
    { name: 'Salon', icon: 'cut', color: '#6B3FA0', bg: '#F0EAFA', proCount: 13 },
  ]);
  const catMap = new Map(categories.map((c) => [c.name, c._id]));

  console.log('[Seed] Creating provider profiles...');
  const providerProfiles = await Provider.insertMany([
    {
      userId: providerUsers[0]._id, name: 'Rajesh Electricals', initials: 'RE',
      category: 'Electrical', serviceCategories: ['Electrical', 'AC & Cooling'],
      rating: 4.8, reviewCount: 245, jobsDone: 520, completionRate: 98,
      totalEarned: 185000, isAvailable: true, phone: '9988776610',
      email: 'rajesh@provider.com', address: 'HSR Layout, Bengaluru',
      bio: 'Licensed electrician with 12 years of experience.',
      languages: ['English', 'Hindi', 'Kannada'],
      bank: { bankName: 'HDFC Bank', maskedNo: '****4567', ifscCode: 'HDFC0001234', accountHolderName: 'Rajesh Electricals', verified: true },
      documents: [
        { type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' },
        { type: 'experience', label: '12 Years Experience', status: 'verified', url: '' },
      ],
    },
    {
      userId: providerUsers[1]._id, name: 'AquaFit Plumbing', initials: 'AP',
      category: 'Plumbing', serviceCategories: ['Plumbing'],
      rating: 4.5, reviewCount: 178, jobsDone: 340, completionRate: 96,
      totalEarned: 112000, isAvailable: true, phone: '9988776611',
      email: 'aquafit@provider.com', address: 'Whitefield, Bengaluru',
      bio: 'Expert plumber specializing in leak detection and pipe repair.',
      languages: ['English', 'Hindi', 'Tamil'],
      bank: { bankName: 'ICICI Bank', maskedNo: '****8901', ifscCode: 'ICIC0005678', accountHolderName: 'AquaFit Plumbing', verified: true },
      documents: [
        { type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' },
        { type: 'experience', label: '8 Years Experience', status: 'verified', url: '' },
      ],
    },
    {
      userId: providerUsers[2]._id, name: 'CoolBreeze AC Services', initials: 'CB',
      category: 'AC & Cooling', serviceCategories: ['AC & Cooling'],
      rating: 4.9, reviewCount: 312, jobsDone: 780, completionRate: 99,
      totalEarned: 245000, isAvailable: true, phone: '9988776612',
      email: 'coolbreeze@provider.com', address: 'Indiranagar, Bengaluru',
      bio: 'Authorized AC service partner for all major brands.',
      languages: ['English', 'Hindi', 'Kannada'],
      bank: { bankName: 'SBI', maskedNo: '****2345', ifscCode: 'SBIN0009012', accountHolderName: 'CoolBreeze AC Services', verified: true },
      documents: [
        { type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' },
        { type: 'experience', label: '15 Years Experience', status: 'verified', url: '' },
        { type: 'background', label: 'Police Verification', status: 'verified', url: '' },
      ],
    },
    {
      userId: providerUsers[3]._id, name: 'SparkFix Electricals', initials: 'SF',
      category: 'Electrical', serviceCategories: ['Electrical'],
      rating: 4.7, reviewCount: 189, jobsDone: 410, completionRate: 97,
      totalEarned: 156000, isAvailable: true, phone: '9988776613',
      email: 'sparkfix@provider.com', address: 'JP Nagar, Bengaluru',
      bio: 'Fast and reliable electrical repair services.',
      languages: ['English', 'Kannada'],
      bank: { bankName: 'Axis Bank', maskedNo: '****6789', ifscCode: 'UTIB0003456', accountHolderName: 'SparkFix Electricals', verified: true },
      documents: [
        { type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' },
        { type: 'experience', label: '10 Years Experience', status: 'verified', url: '' },
      ],
    },
    {
      userId: providerUsers[4]._id, name: 'CleanPro Home Care', initials: 'CP',
      category: 'Cleaning', serviceCategories: ['Cleaning'],
      rating: 4.3, reviewCount: 134, jobsDone: 280, completionRate: 94,
      totalEarned: 89000, isAvailable: true, phone: '9988776614',
      email: 'cleanpro@provider.com', address: 'BTM Layout, Bengaluru',
      bio: 'Professional home cleaning with eco-friendly products.',
      languages: ['English', 'Hindi'],
      bank: { bankName: 'Kotak Mahindra', maskedNo: '****0123', ifscCode: 'KKBK0007890', accountHolderName: 'CleanPro Home Care', verified: true },
      documents: [{ type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' }],
    },
    {
      userId: providerUsers[5]._id, name: 'WoodCraft Carpentry', initials: 'WC',
      category: 'Carpentry', serviceCategories: ['Carpentry'],
      rating: 4.4, reviewCount: 98, jobsDone: 190, completionRate: 95,
      totalEarned: 67000, isAvailable: true, phone: '9988776615',
      email: 'woodcraft@provider.com', address: 'Jayanagar, Bengaluru',
      bio: 'Custom furniture and woodwork. Teak wood specialist.',
      languages: ['English', 'Kannada', 'Telugu'],
      bank: { bankName: 'Bank of Baroda', maskedNo: '****4567', ifscCode: 'BARB0JAYN01', accountHolderName: 'WoodCraft Carpentry', verified: true },
      documents: [
        { type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' },
        { type: 'experience', label: '20 Years Experience', status: 'verified', url: '' },
      ],
    },
  ]);

  console.log('[Seed] Creating services...');
  const serviceDocs = await Service.insertMany([
    {
      categoryId: catMap.get('AC & Cooling')!, name: 'AC Deep Service & Gas Refill',
      provider: 'CoolBreeze AC Services', providerInitials: 'CB',
      providerUserId: providerUsers[2]._id,
      categoryLabel: 'AC & Cooling', mcIcon: 'air-conditioner',
      rating: 4.9, reviews: 312, price: 599, originalPrice: 799,
      badge: 'MOST BOOKED', tags: ['Same-day', '2-yr Warranty', 'Certified'],
      eta: '~15 min', verified: true, accentColor: '#1B4FD8', accentBg: '#E9EFFC',
      jobCount: 3840, shortDesc: 'Full gas top-up, coil cleaning & deep maintenance.',
    },
    {
      categoryId: catMap.get('Plumbing')!, name: 'Home Plumbing Inspection & Repair',
      provider: 'AquaFit Plumbing', providerInitials: 'AP',
      providerUserId: providerUsers[1]._id,
      categoryLabel: 'Plumbing', mcIcon: 'pipe-wrench',
      rating: 4.5, reviews: 178, price: 399,
      badge: 'EDITOR PICK', tags: ['Emergency', 'Licensed', '24/7'],
      eta: '~20 min', verified: true, accentColor: '#3D7A60', accentBg: '#E6F4EC',
      jobCount: 2210, shortDesc: 'Comprehensive leak detection and pipe repair.',
    },
    {
      categoryId: catMap.get('Electrical')!, name: 'Wiring & MCB Panel Replacement',
      provider: 'Rajesh Electricals', providerInitials: 'RE',
      providerUserId: providerUsers[0]._id,
      categoryLabel: 'Electrical', mcIcon: 'lightning-bolt',
      rating: 4.8, reviews: 245, price: 299, originalPrice: 399,
      badge: 'FLASH DEAL', tags: ['ISI Certified', 'Insured', 'Safe'],
      eta: '~10 min', verified: true, accentColor: '#B07D2E', accentBg: '#FBF0D6',
      jobCount: 5620, shortDesc: 'Safe rewiring, MCB upgrades and hazard diagnostics.',
    },
    {
      categoryId: catMap.get('Cleaning')!, name: 'Deep Home Cleaning 2BHK',
      provider: 'CleanPro Home Care', providerInitials: 'CP',
      providerUserId: providerUsers[4]._id,
      categoryLabel: 'Cleaning', mcIcon: 'spray-bottle',
      rating: 4.3, reviews: 134, price: 799,
      badge: 'NEW LAUNCH', tags: ['Eco Products', 'Trained Staff', 'Insured'],
      eta: '~30 min', verified: false, accentColor: '#6B3FA0', accentBg: '#F0EAFA',
      jobCount: 980, shortDesc: 'Floor-to-ceiling deep clean using eco-safe products.',
    },
    {
      categoryId: catMap.get('Carpentry')!, name: 'Custom Furniture & Woodwork',
      provider: 'WoodCraft Carpentry', providerInitials: 'WC',
      providerUserId: providerUsers[5]._id,
      categoryLabel: 'Carpentry', mcIcon: 'saw-blade',
      rating: 4.4, reviews: 98, price: 999,
      tags: ['Custom Work', 'Teak Wood', 'Warranty'],
      eta: '~60 min', verified: true, accentColor: '#A83E20', accentBg: '#FAEAE4',
      jobCount: 760, shortDesc: 'Bespoke furniture design and solid wood repairs.',
    },
    {
      categoryId: catMap.get('Electrical')!, name: 'Switch & Socket Repair',
      provider: 'SparkFix Electricals', providerInitials: 'SF',
      providerUserId: providerUsers[3]._id,
      categoryLabel: 'Electrical', mcIcon: 'power-plug',
      rating: 4.7, reviews: 189, price: 299, originalPrice: 399,
      badge: 'FLASH DEAL', tags: ['Same-day', 'ISI Parts', 'Safe'],
      eta: '~10 min', verified: true, accentColor: '#B07D2E', accentBg: '#FBF0D6',
      jobCount: 4100, shortDesc: 'Quick switch and socket replacement with warranty.',
    },
    {
      categoryId: catMap.get('AC & Cooling')!, name: 'Split AC Installation',
      provider: 'CoolBreeze AC Services', providerInitials: 'CB',
      providerUserId: providerUsers[2]._id,
      categoryLabel: 'AC & Cooling', mcIcon: 'air-conditioner',
      rating: 4.9, reviews: 98, price: 1299, originalPrice: 1599,
      tags: ['Same-day', 'All Brands', 'Warranty'],
      eta: '~45 min', verified: true, accentColor: '#1B4FD8', accentBg: '#E9EFFC',
      jobCount: 960, shortDesc: 'Professional AC installation with warranty.',
    },
    {
      categoryId: catMap.get('Cleaning')!, name: 'Sofa & Carpet Deep Clean',
      provider: 'CleanPro Home Care', providerInitials: 'CP',
      providerUserId: providerUsers[4]._id,
      categoryLabel: 'Cleaning', mcIcon: 'spray-bottle',
      rating: 4.4, reviews: 67, price: 599,
      tags: ['Eco Products', 'Same-day', 'Insured'],
      eta: '~40 min', verified: true, accentColor: '#6B3FA0', accentBg: '#F0EAFA',
      jobCount: 420, shortDesc: 'Deep clean for sofas, carpets and upholstery.',
    },
  ]);
  console.log(`[Seed] Created ${serviceDocs.length} services.`);

  console.log('[Seed] Creating service variations...');
  const variationsData = [
    { serviceIdx: 0, items: [
      { label: 'Basic Service', desc: 'Filter clean + visual check', price: 299, mcIcon: 'air-conditioner', duration: '45 min' },
      { label: 'Deep Service', desc: 'Coil clean, drainage, full tune-up', price: 599, originalPrice: 799, popular: true, mcIcon: 'air-conditioner', duration: '90 min' },
      { label: 'Gas Refill Only', desc: 'Refrigerant top-up (R-22 / R-32)', price: 850, mcIcon: 'gas-cylinder', duration: '30 min' },
      { label: 'Service + Gas Refill', desc: 'Complete deep service with gas top-up', price: 1299, originalPrice: 1599, mcIcon: 'air-conditioner', duration: '2 hrs' },
    ]},
    { serviceIdx: 1, items: [
      { label: 'Health Inspection', desc: 'Full pipe & tap health check', price: 199, mcIcon: 'pipe', duration: '30 min' },
      { label: 'Leakage Repair', desc: 'Fix leaking joints, pipes or taps', price: 399, popular: true, mcIcon: 'pipe-wrench', duration: '60 min' },
      { label: 'Tap Replacement', desc: 'Replace one tap / faucet (part extra)', price: 249, mcIcon: 'water-pump', duration: '30 min' },
      { label: 'Blocked Drain Clear', desc: 'High-pressure drain unclogging', price: 499, mcIcon: 'water', duration: '45 min' },
    ]},
    { serviceIdx: 2, items: [
      { label: 'Basic Inspection', desc: 'Safety check + fault report', price: 149, mcIcon: 'flash-outline', duration: '30 min' },
      { label: 'Switch / Socket Fix', desc: 'Repair or replace up to 3 switches', price: 299, popular: true, originalPrice: 399, mcIcon: 'power-plug', duration: '45 min' },
      { label: 'MCB Replacement', desc: 'Single MCB swap with ISI parts', price: 450, mcIcon: 'electric-switch', duration: '60 min' },
      { label: 'Full Panel Upgrade', desc: 'Complete distribution board replacement', price: 1800, originalPrice: 2200, mcIcon: 'home-lightning-bolt', duration: '3 hrs' },
    ]},
  ];

  let variationCount = 0;
  for (const vg of variationsData) {
    const service = serviceDocs[vg.serviceIdx];
    if (service) {
      await ServiceVariation.insertMany(
        vg.items.map((item) => ({ ...item, serviceId: service._id }))
      );
      variationCount += vg.items.length;
    }
  }
  console.log(`[Seed] Created ${variationCount} service variations.`);

  console.log('[Seed] Creating addresses...');
  const addresses = await Address.insertMany([
    {
      userId: consumers[0]._id, label: 'Home',
      fullAddress: '42, 1st Cross, Koramangala 5th Block, Near Jyoti Nivas College, Bengaluru 560095',
      city: 'Bengaluru', pincode: '560095',
      coordinates: { type: 'Point', coordinates: [77.6245, 12.9352] },
      isDefault: true,
    },
    {
      userId: consumers[0]._id, label: 'Office',
      fullAddress: '15th Floor, Prestige Tech Park, Outer Ring Road, Opposite RmZ Ecoworld, Bengaluru 560103',
      city: 'Bengaluru', pincode: '560103',
      coordinates: { type: 'Point', coordinates: [77.6912, 12.9698] },
      isDefault: false,
    },
    {
      userId: consumers[1]._id, label: 'Home',
      fullAddress: '78, Link Road, Andheri West, Near S.V. Road Metro Station, Mumbai 400053',
      city: 'Mumbai', pincode: '400053',
      coordinates: { type: 'Point', coordinates: [72.8347, 19.1364] },
      isDefault: true,
    },
    {
      userId: consumers[2]._id, label: 'Home',
      fullAddress: 'Sector 62, Wave Executive Tower, Near Metro Station, Noida 201301',
      city: 'Noida', pincode: '201301',
      coordinates: { type: 'Point', coordinates: [77.3597, 28.6229] },
      isDefault: true,
    },
    {
      userId: consumers[3]._id, label: 'Home',
      fullAddress: '8-2-608/B, Road No 10, Banjara Hills, Near KBR Park, Hyderabad 500034',
      city: 'Hyderabad', pincode: '500034',
      coordinates: { type: 'Point', coordinates: [78.4048, 17.4156] },
      isDefault: true,
    },
  ]);

  console.log('[Seed] Creating bookings...');
  const now = new Date();
  const bookings = await Booking.insertMany([
    {
      consumerId: consumers[0]._id,
      providerId: providerProfiles[2]._id,
      requestNo: 'REQ-20260701-001',
      customer: { name: 'Rahul Sharma', initials: 'RS', rating: 4.5, totalOrders: 8, phone: '9876543210' },
      status: 'upcoming', providerStatus: 'new',
      serviceType: 'AC & Cooling', serviceName: 'AC Deep Service & Gas Refill',
      services: [{ name: 'Deep Service', quantity: 1, price: 599 }],
      location: { address: '42, 1st Cross, Koramangala 5th Block, Bengaluru', city: 'Bengaluru', distanceKm: 3.2, etaMins: 15 },
      scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      durationMins: 90, timeSlot: '2:00 PM - 3:30 PM',
      address: '42, 1st Cross, Koramangala 5th Block, Bengaluru',
      payment: 'prepaid', totalAmount: 599, price: 599, isPaid: true,
      bookingRef: 'LF-20260701-001', mcIcon: 'air-conditioner',
      color: '#1B4FD8', bg: '#E9EFFC', accentColor: '#1B4FD8',
      category: 'AC & Cooling', canReschedule: true, canCancel: true,
      canTrack: true, proAvatar: '', providerName: 'CoolBreeze AC Services',
      initials: 'CB', date: 'Today', time: '2:00 PM',
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done', timestamp: now },
        { label: 'Provider Assigned', detail: 'CoolBreeze AC Services is on the way', state: 'current' },
        { label: 'Service Started', detail: '', state: 'pending' },
        { label: 'Service Completed', detail: '', state: 'pending' },
      ],
    },
    {
      consumerId: consumers[0]._id,
      providerId: providerProfiles[0]._id,
      requestNo: 'REQ-20260701-002',
      customer: { name: 'Rahul Sharma', initials: 'RS', rating: 4.5, totalOrders: 8, phone: '9876543210' },
      status: 'ongoing', providerStatus: 'active',
      serviceType: 'Electrical', serviceName: 'Wiring & MCB Panel Replacement',
      services: [{ name: 'MCB Replacement', quantity: 1, price: 299 }],
      location: { address: '15th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru', city: 'Bengaluru', distanceKm: 8.5, etaMins: 25 },
      scheduledAt: new Date(now.getTime() - 30 * 60 * 1000),
      durationMins: 60, timeSlot: '11:00 AM - 12:00 PM',
      address: '15th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru',
      payment: 'cash', totalAmount: 299, price: 299, isPaid: false,
      bookingRef: 'LF-20260701-002', mcIcon: 'lightning-bolt',
      color: '#B07D2E', bg: '#FBF0D6', accentColor: '#B07D2E',
      category: 'Electrical', canReschedule: false, canCancel: false,
      canTrack: true, proAvatar: '', providerName: 'Rajesh Electricals',
      initials: 'RE', date: 'Today', time: '11:00 AM',
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done', timestamp: new Date(now.getTime() - 60 * 60 * 1000) },
        { label: 'Provider Arrived', detail: 'Rajesh Electricals has arrived', state: 'done', timestamp: new Date(now.getTime() - 30 * 60 * 1000) },
        { label: 'Service in Progress', detail: 'MCB panel being replaced', state: 'current' },
        { label: 'Service Completed', detail: '', state: 'pending' },
      ],
    },
    {
      consumerId: consumers[0]._id,
      providerId: providerProfiles[4]._id,
      requestNo: 'REQ-20260630-003',
      customer: { name: 'Rahul Sharma', initials: 'RS', rating: 4.5, totalOrders: 8, phone: '9876543210' },
      status: 'completed', providerStatus: 'done',
      serviceType: 'Cleaning', serviceName: 'Deep Home Cleaning 2BHK',
      services: [{ name: '2BHK Deep Clean', quantity: 1, price: 799 }],
      location: { address: '42, 1st Cross, Koramangala 5th Block, Bengaluru', city: 'Bengaluru', distanceKm: 3.2, etaMins: 15 },
      scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      durationMins: 120, timeSlot: '10:00 AM - 12:00 PM',
      address: '42, 1st Cross, Koramangala 5th Block, Bengaluru',
      payment: 'prepaid', totalAmount: 799, price: 799, isPaid: true,
      bookingRef: 'LF-20260630-003', mcIcon: 'spray-bottle',
      color: '#6B3FA0', bg: '#F0EAFA', accentColor: '#6B3FA0',
      category: 'Cleaning', canReschedule: false, canCancel: false,
      canReview: true, proAvatar: '', providerName: 'CleanPro Home Care',
      initials: 'CP', date: 'Yesterday', time: '10:00 AM',
      rating: 5, customerRating: 5,
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done' },
        { label: 'Provider Arrived', detail: 'CleanPro Home Care arrived', state: 'done' },
        { label: 'Service Completed', detail: 'All rooms cleaned successfully', state: 'done' },
      ],
    },
    {
      consumerId: consumers[1]._id,
      providerId: providerProfiles[1]._id,
      requestNo: 'REQ-20260629-004',
      customer: { name: 'Priya Patel', initials: 'PP', rating: 4.2, totalOrders: 3, phone: '9876543211' },
      status: 'completed', providerStatus: 'done',
      serviceType: 'Plumbing', serviceName: 'Home Plumbing Inspection & Repair',
      services: [{ name: 'Leakage Repair', quantity: 1, price: 399 }],
      location: { address: '78, Link Road, Andheri West, Mumbai', city: 'Mumbai', distanceKm: 5.1, etaMins: 20 },
      scheduledAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      durationMins: 60, timeSlot: '3:00 PM - 4:00 PM',
      address: '78, Link Road, Andheri West, Mumbai',
      payment: 'upi', totalAmount: 399, price: 399, isPaid: true,
      bookingRef: 'LF-20260629-004', mcIcon: 'pipe-wrench',
      color: '#3D7A60', bg: '#E6F4EC', accentColor: '#3D7A60',
      category: 'Plumbing', canReschedule: false, canCancel: false,
      canReview: true, proAvatar: '', providerName: 'AquaFit Plumbing',
      initials: 'AP', date: '29 Jun', time: '3:00 PM',
      rating: 4, customerRating: 4,
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done' },
        { label: 'Provider Arrived', detail: 'AquaFit Plumbing arrived', state: 'done' },
        { label: 'Service Completed', detail: 'Leak repaired successfully', state: 'done' },
      ],
    },
    {
      consumerId: consumers[2]._id,
      providerId: providerProfiles[2]._id,
      requestNo: 'REQ-20260628-005',
      customer: { name: 'Amit Kumar', initials: 'AK', rating: 4.8, totalOrders: 22, phone: '9876543212' },
      status: 'completed', providerStatus: 'done',
      serviceType: 'AC & Cooling', serviceName: 'Split AC Installation',
      services: [{ name: 'AC Installation', quantity: 1, price: 1299 }],
      location: { address: 'Sector 62, Wave Executive Tower, Noida', city: 'Noida', distanceKm: 2.8, etaMins: 10 },
      scheduledAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      durationMins: 120, timeSlot: '11:00 AM - 1:00 PM',
      address: 'Sector 62, Wave Executive Tower, Noida',
      payment: 'prepaid', totalAmount: 1299, price: 1299, isPaid: true,
      bookingRef: 'LF-20260628-005', mcIcon: 'air-conditioner',
      color: '#1B4FD8', bg: '#E9EFFC', accentColor: '#1B4FD8',
      category: 'AC & Cooling', canReschedule: false, canCancel: false,
      canReview: true, proAvatar: '', providerName: 'CoolBreeze AC Services',
      initials: 'CB', date: '28 Jun', time: '11:00 AM',
      rating: 5, customerRating: 5,
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done' },
        { label: 'Provider Arrived', detail: 'CoolBreeze AC Services arrived', state: 'done' },
        { label: 'Service Completed', detail: 'AC installed and tested', state: 'done' },
      ],
    },
    {
      consumerId: consumers[3]._id,
      providerId: providerProfiles[5]._id,
      requestNo: 'REQ-20260627-006',
      customer: { name: 'Sneha Reddy', initials: 'SR', rating: 4.6, totalOrders: 12, phone: '9876543213' },
      status: 'cancelled', providerStatus: 'cancelled',
      serviceType: 'Carpentry', serviceName: 'Custom Furniture & Woodwork',
      services: [{ name: 'Bookshelf Design', quantity: 1, price: 999 }],
      location: { address: '8-2-608/B, Road No 10, Banjara Hills, Hyderabad', city: 'Hyderabad', distanceKm: 4.5, etaMins: 30 },
      scheduledAt: new Date(now.getTime() - 96 * 60 * 60 * 1000),
      durationMins: 180, timeSlot: '9:00 AM - 12:00 PM',
      address: '8-2-608/B, Road No 10, Banjara Hills, Hyderabad',
      payment: 'prepaid', totalAmount: 999, price: 999, isPaid: true,
      bookingRef: 'LF-20260627-006', mcIcon: 'saw-blade',
      color: '#A83E20', bg: '#FAEAE4', accentColor: '#A83E20',
      category: 'Carpentry', canReschedule: false, canCancel: false,
      proAvatar: '', providerName: 'WoodCraft Carpentry',
      initials: 'WC', date: '27 Jun', time: '9:00 AM',
      cancelledAt: new Date(now.getTime() - 98 * 60 * 60 * 1000),
      cancelReason: 'Schedule conflict',
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done' },
        { label: 'Cancelled', detail: 'Booking cancelled by consumer', state: 'done' },
      ],
    },
    {
      consumerId: consumers[0]._id,
      providerId: providerProfiles[3]._id,
      requestNo: 'REQ-20260625-007',
      customer: { name: 'Rahul Sharma', initials: 'RS', rating: 4.5, totalOrders: 8, phone: '9876543210' },
      status: 'completed', providerStatus: 'done',
      serviceType: 'Electrical', serviceName: 'Switch & Socket Repair',
      services: [{ name: 'Switch Fix', quantity: 3, price: 299 }],
      location: { address: '42, 1st Cross, Koramangala 5th Block, Bengaluru', city: 'Bengaluru', distanceKm: 3.2, etaMins: 15 },
      scheduledAt: new Date(now.getTime() - 120 * 60 * 60 * 1000),
      durationMins: 45, timeSlot: '4:00 PM - 4:45 PM',
      address: '42, 1st Cross, Koramangala 5th Block, Bengaluru',
      payment: 'wallet', totalAmount: 299, price: 299, isPaid: true,
      bookingRef: 'LF-20260625-007', mcIcon: 'power-plug',
      color: '#B07D2E', bg: '#FBF0D6', accentColor: '#B07D2E',
      category: 'Electrical', canReschedule: false, canCancel: false,
      canReview: true, proAvatar: '', providerName: 'SparkFix Electricals',
      initials: 'SF', date: '25 Jun', time: '4:00 PM',
      rating: 4, customerRating: 4,
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done' },
        { label: 'Provider Arrived', detail: 'SparkFix Electricals arrived', state: 'done' },
        { label: 'Service Completed', detail: 'All switches replaced', state: 'done' },
      ],
    },
    {
      consumerId: consumers[2]._id,
      providerId: providerProfiles[0]._id,
      requestNo: 'REQ-20260620-008',
      customer: { name: 'Amit Kumar', initials: 'AK', rating: 4.8, totalOrders: 22, phone: '9876543212' },
      status: 'completed', providerStatus: 'done',
      serviceType: 'Electrical', serviceName: 'Wiring & MCB Panel Replacement',
      services: [{ name: 'Full Panel Upgrade', quantity: 1, price: 1800 }],
      location: { address: 'Sector 62, Wave Executive Tower, Noida', city: 'Noida', distanceKm: 2.8, etaMins: 10 },
      scheduledAt: new Date(now.getTime() - 200 * 60 * 60 * 1000),
      durationMins: 180, timeSlot: '9:00 AM - 12:00 PM',
      address: 'Sector 62, Wave Executive Tower, Noida',
      payment: 'prepaid', totalAmount: 1800, price: 1800, isPaid: true,
      bookingRef: 'LF-20260620-008', mcIcon: 'lightning-bolt',
      color: '#B07D2E', bg: '#FBF0D6', accentColor: '#B07D2E',
      category: 'Electrical', canReschedule: false, canCancel: false,
      canReview: true, proAvatar: '', providerName: 'Rajesh Electricals',
      initials: 'RE', date: '20 Jun', time: '9:00 AM',
      rating: 5, customerRating: 5,
      steps: [
        { label: 'Booking Confirmed', detail: 'Your booking has been confirmed', state: 'done' },
        { label: 'Provider Arrived', detail: 'Rajesh Electricals arrived', state: 'done' },
        { label: 'Service Completed', detail: 'Panel upgraded successfully', state: 'done' },
      ],
    },
  ]);

  console.log('[Seed] Creating wallets...');
  await Wallet.insertMany([
    { userId: consumers[0]._id, balance: 2500, holdBalance: 0, totalAdded: 5000, totalCashback: 350, currency: 'INR' },
    { userId: consumers[1]._id, balance: 800, holdBalance: 0, totalAdded: 1500, totalCashback: 100, currency: 'INR' },
    { userId: consumers[2]._id, balance: 5200, holdBalance: 0, totalAdded: 15000, totalCashback: 800, currency: 'INR' },
    { userId: consumers[3]._id, balance: 1200, holdBalance: 0, totalAdded: 3000, totalCashback: 200, currency: 'INR' },
    { userId: consumers[4]._id, balance: 500, holdBalance: 0, totalAdded: 500, totalCashback: 0, currency: 'INR' },
  ]);

  console.log('[Seed] Creating transactions...');
  await Transaction.insertMany([
    {
      userId: consumers[0]._id, title: 'Wallet Top-up', subtitle: 'Added via UPI',
      amount: 2000, type: 'credit', status: 'success', date: '01 Jul', time: '9:00 AM',
      icon: 'wallet-plus-outline', iconColor: '#10B981', paymentMethod: 'upi',
    },
    {
      userId: consumers[0]._id, title: 'AC Deep Service', subtitle: 'Booking LF-20260630-003',
      amount: 799, type: 'debit', status: 'success', date: '30 Jun', time: '10:00 AM',
      icon: 'air-conditioner', iconColor: '#1B4FD8', bookingRef: 'LF-20260630-003',
    },
    {
      userId: consumers[0]._id, title: 'Cashback Earned', subtitle: '10% on AC Service',
      amount: 80, type: 'cashback', status: 'success', date: '30 Jun', time: '12:30 PM',
      icon: 'cash-back', iconColor: '#10B981', bookingRef: 'LF-20260630-003',
    },
    {
      userId: consumers[0]._id, title: 'Switch Repair', subtitle: 'Booking LF-20260625-007',
      amount: 299, type: 'debit', status: 'success', date: '25 Jun', time: '4:45 PM',
      icon: 'power-plug', iconColor: '#B07D2E', bookingRef: 'LF-20260625-007',
    },
    {
      userId: consumers[0]._id, title: 'Wallet Top-up', subtitle: 'Added via Card',
      amount: 3000, type: 'credit', status: 'success', date: '20 Jun', time: '2:00 PM',
      icon: 'wallet-plus-outline', iconColor: '#10B981', paymentMethod: 'card',
    },
    {
      userId: consumers[1]._id, title: 'Plumbing Repair', subtitle: 'Booking LF-20260629-004',
      amount: 399, type: 'debit', status: 'success', date: '29 Jun', time: '4:00 PM',
      icon: 'pipe-wrench', iconColor: '#3D7A60', bookingRef: 'LF-20260629-004',
    },
    {
      userId: consumers[2]._id, title: 'AC Installation', subtitle: 'Booking LF-20260628-005',
      amount: 1299, type: 'debit', status: 'success', date: '28 Jun', time: '1:00 PM',
      icon: 'air-conditioner', iconColor: '#1B4FD8', bookingRef: 'LF-20260628-005',
    },
    {
      userId: consumers[2]._id, title: 'Panel Upgrade', subtitle: 'Booking LF-20260620-008',
      amount: 1800, type: 'debit', status: 'success', date: '20 Jun', time: '12:00 PM',
      icon: 'lightning-bolt', iconColor: '#B07D2E', bookingRef: 'LF-20260620-008',
    },
  ]);

  console.log('[Seed] Creating reviews...');
  await Review.insertMany([
    {
      bookingId: bookings[2]._id,
      consumerId: consumers[0]._id,
      providerId: providerProfiles[4]._id,
      serviceId: serviceDocs[3]._id,
      rating: 5,
      title: 'Excellent cleaning service!',
      comment: 'The team arrived on time and did a thorough job. My house looks brand new. Highly recommend CleanPro!',
      isVerified: true,
    },
    {
      bookingId: bookings[3]._id,
      consumerId: consumers[1]._id,
      providerId: providerProfiles[1]._id,
      serviceId: serviceDocs[1]._id,
      rating: 4,
      title: 'Good plumbing work',
      comment: 'Fixed the leak quickly. Professional and courteous. Slightly higher price but worth it.',
      isVerified: true,
    },
    {
      bookingId: bookings[4]._id,
      consumerId: consumers[2]._id,
      providerId: providerProfiles[2]._id,
      serviceId: serviceDocs[6]._id,
      rating: 5,
      title: 'Best AC installation',
      comment: 'CoolBreeze team was fantastic. Quick installation, proper testing, and great cleanup after.',
      isVerified: true,
    },
    {
      bookingId: bookings[6]._id,
      consumerId: consumers[0]._id,
      providerId: providerProfiles[3]._id,
      serviceId: serviceDocs[5]._id,
      rating: 4,
      title: 'Quick and reliable',
      comment: 'SparkFix replaced 3 switches in under 30 minutes. ISI-certified parts used. Good service.',
      isVerified: true,
    },
    {
      bookingId: bookings[7]._id,
      consumerId: consumers[2]._id,
      providerId: providerProfiles[0]._id,
      serviceId: serviceDocs[2]._id,
      rating: 5,
      title: 'Professional panel upgrade',
      comment: 'Rajesh did a complete panel upgrade for my office. Very thorough and safety-conscious.',
      isVerified: true,
    },
  ]);

  console.log('[Seed] Creating promos...');
  const promos = await Promo.insertMany([
    { tag: 'LIMITED TIME', headline: 'Flat ₹150 Off', body: 'On your first AC or Electrical booking. Use code at checkout.', cta: 'Grab Deal', accent: '#3B6FE8', darkBg: '#0B1829', mcIcon: 'lightning-bolt' },
    { tag: 'WALLET OFFER', headline: '10% Cashback', body: 'Add ₹1,000 or more to your wallet and earn instant cashback.', cta: 'Add Money', accent: '#3D7A60', darkBg: '#0E1F18', mcIcon: 'wallet-plus-outline' },
    { tag: 'NEW USER', headline: 'Free Inspection', body: 'Book any Plumbing service and get a complimentary health checkup.', cta: 'Book Now', accent: '#C0522B', darkBg: '#1F0F09', mcIcon: 'wrench-outline' },
  ]);

  console.log('[Seed] Creating offers...');
  const offers = await Offer.insertMany([
    { title: 'Flat ₹150 Off', subtitle: 'On your next AC or Electrical booking', discount: '₹150', code: 'LOCALFIX150', expiry: 'Expires 31 Mar', color: '#2563EB', icon: 'lightning-bolt' },
    { title: '10% Cashback', subtitle: 'Add ₹1000+ to wallet & get cashback', discount: '10%', code: 'WALLET10', expiry: 'Expires 20 Mar', color: '#10B981', icon: 'wallet-outline' },
    { title: 'Free Inspection', subtitle: 'On first Plumbing or Carpentry booking', discount: 'FREE', code: 'FIRSTFIX', expiry: 'Limited period', color: '#7C3AED', icon: 'wrench-outline' },
  ]);

  console.log('[Seed] Seeding master catalog...');
  await seedCatalog(false);

  console.log('[Seed] ===== SEED COMPLETE =====');
  console.log('[Seed] Summary:');
  console.log(`  - ${consumers.length} consumers`);
  console.log(`  - ${providerUsers.length} provider users`);
  console.log(`  - ${providerProfiles.length} provider profiles`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${serviceDocs.length} services`);
  console.log(`  - ${addresses.length} addresses`);
  console.log(`  - ${bookings.length} bookings`);
  console.log('  - 5 wallets');
  console.log('  - 8 transactions');
  console.log('  - 5 reviews');
  console.log(`  - ${promos.length} promos`);
  console.log(`  - ${offers.length} offers`);
  console.log('[Seed] Test login credentials:');
  console.log('  Consumer: rahul@example.com / password123');
  console.log('  Provider: rajesh@provider.com / password123');

  await mongoose.disconnect();
  console.log('[Seed] Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('[Seed] Fatal error:', err);
  process.exit(1);
});
