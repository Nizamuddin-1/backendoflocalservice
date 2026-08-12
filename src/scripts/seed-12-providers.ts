import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User, Provider } from '../models';
import { env } from '../config/env';

const MONGO_URI = env.mongodbUri || 'mongodb://localhost:27017/localfix';

const providerData = [
  { name: 'FixIt Fast Plumbing', email: 'fixit@provider.com', phone: '9800000001', category: 'Plumbing', tier: 'Gold' },
  { name: 'Star Painting Services', email: 'starpaint@provider.com', phone: '9800000002', category: 'Painting', tier: 'Silver' },
  { name: 'Urban Pest Solutions', email: 'urbanpest@provider.com', phone: '9800000003', category: 'Pest Control', tier: 'Platinum' },
  { name: 'Glamour Salon & Spa', email: 'glamour@provider.com', phone: '9800000004', category: 'Salon', tier: 'Gold' },
  { name: 'Reliable Carpenters', email: 'reliablewood@provider.com', phone: '9800000005', category: 'Carpentry', tier: 'Silver' },
  { name: 'Elite Deep Cleaning', email: 'eliteclean@provider.com', phone: '9800000006', category: 'Cleaning', tier: 'Gold' },
  { name: 'SuperCool AC Repair', email: 'supercool@provider.com', phone: '9800000007', category: 'AC & Cooling', tier: 'Platinum' },
  { name: 'Bright Sparks Electrical', email: 'brightsparks@provider.com', phone: '9800000008', category: 'Electrical', tier: 'Silver' },
  { name: 'Modern Woodworks', email: 'modernwood@provider.com', phone: '9800000009', category: 'Carpentry', tier: 'Gold' },
  { name: 'Rapid Response Plumbing', email: 'rapidplumb@provider.com', phone: '9800000010', category: 'Plumbing', tier: 'Silver' },
  { name: 'Fresh Coat Painters', email: 'freshcoat@provider.com', phone: '9800000011', category: 'Painting', tier: 'Gold' },
  { name: 'BugFree Experts', email: 'bugfree@provider.com', phone: '9800000012', category: 'Pest Control', tier: 'Platinum' },
];

async function seedProviders() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('[Seed] Connected to', MONGO_URI);

  const passwordHash = await bcrypt.hash('password123', 12);

  console.log('[Seed] Creating 12 new provider users...');
  
  const usersToInsert = providerData.map(p => ({
    name: p.name,
    email: p.email,
    phone: p.phone,
    password: passwordHash,
    role: 'provider',
    location: 'Bengaluru, India',
    tier: p.tier,
    loyaltyPoints: Math.floor(Math.random() * 1000),
    isPhoneVerified: true,
    referralCode: p.name.substring(0, 4).toUpperCase() + Math.floor(Math.random() * 10000)
  }));

  const insertedUsers = await User.insertMany(usersToInsert);
  console.log(`[Seed] Successfully inserted ${insertedUsers.length} users.`);

  console.log('[Seed] Creating corresponding provider profiles...');
  const profilesToInsert = insertedUsers.map((user, index) => {
    const p = providerData[index];
    const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    
    return {
      userId: user._id,
      name: p.name,
      initials: initials,
      category: p.category,
      serviceCategories: [p.category],
      rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 to 5.0
      reviewCount: Math.floor(Math.random() * 300) + 20,
      jobsDone: Math.floor(Math.random() * 800) + 50,
      completionRate: Math.floor(Math.random() * 10) + 90, // 90 to 99
      totalEarned: Math.floor(Math.random() * 200000) + 50000,
      isAvailable: true,
      phone: p.phone,
      email: p.email,
      address: 'Bengaluru, India',
      bio: `Professional ${p.category} services with years of experience.`,
      languages: ['English', 'Hindi', 'Kannada'],
      bank: { 
        bankName: 'HDFC Bank', 
        maskedNo: '****' + Math.floor(1000 + Math.random() * 9000), 
        ifscCode: 'HDFC0001234', 
        accountHolderName: p.name, 
        verified: true 
      },
      documents: [
        { type: 'aadhaar', label: 'Aadhaar Card', status: 'verified', url: '' },
        { type: 'experience', label: '5+ Years Experience', status: 'verified', url: '' },
      ],
    };
  });

  const insertedProfiles = await Provider.insertMany(profilesToInsert);
  console.log(`[Seed] Successfully inserted ${insertedProfiles.length} provider profiles.`);
  
  console.log('[Seed] ===== 12 PROVIDERS SEED COMPLETE =====');
  
  await mongoose.disconnect();
  console.log('[Seed] Disconnected from MongoDB.');
}

seedProviders().catch((err) => {
  console.error('[Seed] Fatal error:', err);
  process.exit(1);
});
