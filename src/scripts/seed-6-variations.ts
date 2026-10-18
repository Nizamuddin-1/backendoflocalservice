import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Service, ServiceVariation } from '../models';
import { env } from '../config/env';

const MONGO_URI = env.mongodbUri || 'mongodb://localhost:27017/localfix';

const generateVariations = (serviceId: mongoose.Types.ObjectId, basePrice: number, index: number) => {
  return [
    {
      serviceId,
      label: 'Basic Package',
      desc: 'Standard service with basic inspection and fix.',
      price: basePrice,
      originalPrice: basePrice + 100,
      popular: false,
      mcIcon: 'shield-check-outline',
      duration: '45 mins',
    },
    {
      serviceId,
      label: 'Standard Package',
      desc: 'Includes deep cleaning and preventive maintenance.',
      price: Math.floor(basePrice * 1.5),
      originalPrice: Math.floor(basePrice * 1.5) + 150,
      popular: true,
      mcIcon: 'star-circle-outline',
      duration: '1 hr 30 mins',
    },
    {
      serviceId,
      label: 'Premium Package',
      desc: 'Comprehensive service with 6 months warranty.',
      price: basePrice * 2,
      originalPrice: (basePrice * 2) + 200,
      popular: false,
      mcIcon: 'crown-outline',
      duration: '2 hrs',
    },
    {
      serviceId,
      label: 'Quick Fix',
      desc: 'Rapid response for minor issues and adjustments.',
      price: Math.floor(basePrice * 0.6),
      originalPrice: basePrice,
      popular: false,
      mcIcon: 'lightning-bolt-outline',
      duration: '30 mins',
    },
    {
      serviceId,
      label: 'Annual Maintenance (AMC)',
      desc: 'Year-long coverage with 4 free visits.',
      price: basePrice * 5,
      originalPrice: (basePrice * 5) + 1000,
      popular: false,
      mcIcon: 'calendar-sync-outline',
      duration: '1 yr',
    },
    {
      serviceId,
      label: 'Deep Inspection',
      desc: 'Detailed diagnostics and written report.',
      price: Math.floor(basePrice * 0.8),
      originalPrice: basePrice + 50,
      popular: false,
      mcIcon: 'magnify-scan',
      duration: '1 hr',
    },
  ];
};

async function seedVariations() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('[Seed] Connected to', MONGO_URI);

  console.log('[Seed] Fetching all services...');
  const services = await Service.find({});
  console.log(`[Seed] Found ${services.length} services.`);

  if (services.length === 0) {
    console.log('[Seed] No services found. Exiting.');
    process.exit(0);
  }

  console.log('[Seed] Clearing existing variations...');
  await ServiceVariation.deleteMany({});
  console.log('[Seed] Cleared existing variations.');

  console.log('[Seed] Creating 6 variations for each service...');
  const variationsToInsert: any[] = [];
  
  services.forEach((service, index) => {
    const variations = generateVariations(service._id as mongoose.Types.ObjectId, service.price || 499, index);
    variationsToInsert.push(...variations);
  });

  const inserted = await ServiceVariation.insertMany(variationsToInsert);
  console.log(`[Seed] Successfully inserted ${inserted.length} variations.`);
  
  console.log('[Seed] ===== 6 VARIATIONS SEED COMPLETE =====');
  
  await mongoose.disconnect();
  console.log('[Seed] Disconnected from MongoDB.');
}

seedVariations().catch((err) => {
  console.error('[Seed] Fatal error:', err);
  process.exit(1);
});
