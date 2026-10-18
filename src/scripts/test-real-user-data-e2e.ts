import mongoose from 'mongoose';
import http from 'http';
import app from '../app';
import { env } from '../config/env';
import { User, Provider } from '../models';
import { generateAccessToken } from '../middleware/auth';

async function runTests() {
  console.log('=== Starting Real User Data E2E Test Suite ===');
  await mongoose.connect(env.mongodbUri);
  console.log('✓ Connected to MongoDB');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Ephemeral test server running at ${baseUrl}`);

  try {
    // 0. Clean up previous test run data
    await User.deleteMany({
      email: { $in: ['test.consumer.real@example.com', 'test.provider.real@example.com', 'test.consumer.two@example.com'] },
    });
    await Provider.deleteMany({
      email: { $in: ['test.provider.real@example.com'] },
    });

    // 1. Create Test Consumer
    const consumerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'test.consumer.real@example.com',
      phone: '+919876543210',
      password: 'hashedPassword123',
      role: 'consumer',
      location: 'Koramangala, Bengaluru',
      tier: 'Gold',
      loyaltyPoints: 450,
      totalSpent: 12499,
      bookingsCount: 8,
    });
    const consumerToken = generateAccessToken({
      userId: consumerUser._id.toString(),
      role: 'consumer',
    });
    console.log('✓ Created test consumer: Rahul Sharma');

    // 2. Create Test Provider User & Provider Record
    const providerUser = await User.create({
      name: 'Rajesh Electricals',
      email: 'test.provider.real@example.com',
      phone: '+919876543211',
      password: 'hashedPassword123',
      role: 'provider',
      location: 'Civil Lines, Agra',
    });
    const providerRecord = await Provider.create({
      userId: providerUser._id,
      name: 'Rajesh Electricals',
      initials: 'RE',
      category: 'Electrician',
      serviceCategories: ['Electrician', 'Wiring & Lighting', 'Appliance Installation'],
      rating: 4.9,
      reviewCount: 128,
      jobsDone: 342,
      completionRate: 99,
      totalEarned: 184500,
      isAvailable: true,
      phone: '+919876543211',
      email: 'test.provider.real@example.com',
      address: 'Shop 4, Civil Lines, Agra',
      bio: 'Certified master electrician with 10 years experience.',
      languages: ['English', 'Hindi'],
      bank: {
        bankName: 'HDFC Bank',
        maskedNo: '4821',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Rajesh Kumar',
        verified: true,
      },
    });
    const providerToken = generateAccessToken({
      userId: providerUser._id.toString(),
      role: 'provider',
    });
    console.log('✓ Created test provider: Rajesh Electricals (initials: RE)');

    // 3. Create Second Consumer for account switching test
    const consumerTwo = await User.create({
      name: 'Amit Kumar',
      email: 'test.consumer.two@example.com',
      phone: '+919876543212',
      password: 'hashedPassword123',
      role: 'consumer',
      location: 'Indiranagar, Bengaluru',
      tier: 'Silver',
    });
    const consumerTwoToken = generateAccessToken({
      userId: consumerTwo._id.toString(),
      role: 'consumer',
    });
    console.log('✓ Created second consumer: Amit Kumar');

    // ─── TEST SCENARIO 1: Consumer Profile Endpoints & Contract ───────────────
    console.log('\n--- Scenario 1: Consumer Profile End-to-End Fetch ---');
    // Test 1a: Unauthenticated should fail with 401
    const unauthRes = await fetch(`${baseUrl}/api/consumer/profile`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated profile, got ${unauthRes.status}`);
    }
    console.log('✓ PASS: Unauthenticated GET /api/consumer/profile returns 401');

    // Test 1b: Authenticated GET /api/consumer/profile
    const consumerProfileRes = await fetch(`${baseUrl}/api/consumer/profile`, {
      headers: { Authorization: `Bearer ${consumerToken}` },
    });
    if (consumerProfileRes.status !== 200) {
      throw new Error(`Expected 200 for consumer profile, got ${consumerProfileRes.status}`);
    }
    const consumerProfileBody: any = await consumerProfileRes.json();
    const cData = consumerProfileBody.data;
    if (cData.name !== 'Rahul Sharma') throw new Error(`Expected name 'Rahul Sharma', got '${cData.name}'`);
    if (cData.location !== 'Koramangala, Bengaluru') throw new Error(`Expected location 'Koramangala, Bengaluru', got '${cData.location}'`);
    if (cData.phone !== '+919876543210') throw new Error(`Expected phone '+919876543210', got '${cData.phone}'`);
    if (cData.password !== undefined || cData.refreshToken !== undefined) {
      throw new Error('Security violation: sensitive fields (password, refreshToken) returned');
    }
    console.log('✓ PASS: Authenticated GET /api/consumer/profile returns real DB user data and excludes password');

    // Test 1c: GET /api/auth/me also returns same real data
    const authMeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${consumerToken}` },
    });
    if (authMeRes.status !== 200) throw new Error(`Expected 200 for /api/auth/me, got ${authMeRes.status}`);
    const authMeBody: any = await authMeRes.json();
    if (authMeBody.data.name !== 'Rahul Sharma') throw new Error(`Expected name 'Rahul Sharma' on /api/auth/me`);
    console.log('✓ PASS: Authenticated GET /api/auth/me returns matching real user data');

    // ─── TEST SCENARIO 2: Provider Profile Endpoints & Contract ───────────────
    console.log('\n--- Scenario 2: Provider Profile End-to-End Fetch ---');
    // Test 2a: Authenticated GET /api/provider/profile
    const providerProfileRes = await fetch(`${baseUrl}/api/provider/profile`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    if (providerProfileRes.status !== 200) {
      throw new Error(`Expected 200 for provider profile, got ${providerProfileRes.status}`);
    }
    const providerProfileBody: any = await providerProfileRes.json();
    const pData = providerProfileBody.data;
    if (pData.name !== 'Rajesh Electricals') throw new Error(`Expected provider name 'Rajesh Electricals', got '${pData.name}'`);
    if (pData.initials !== 'RE') throw new Error(`Expected initials 'RE', got '${pData.initials}'`);
    if (pData.bank?.bankName !== 'HDFC Bank') throw new Error(`Expected bank 'HDFC Bank', got '${pData.bank?.bankName}'`);
    if (pData.bank?.maskedNo !== '4821') throw new Error(`Expected maskedNo '4821', got '${pData.bank?.maskedNo}'`);
    if (!Array.isArray(pData.serviceCategories) || pData.serviceCategories.length !== 3) {
      throw new Error(`Expected 3 service categories, got ${JSON.stringify(pData.serviceCategories)}`);
    }
    console.log('✓ PASS: Authenticated GET /api/provider/profile returns real DB provider profile with bank & categories');

    // ─── TEST SCENARIO 3: Profile Updates & Persistence ─────────────────────────
    console.log('\n--- Scenario 3: Real-Time Profile Updates & Sync ---');
    const updateRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${consumerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Rahul K. Sharma',
        location: 'Whitefield, Bengaluru',
      }),
    });
    if (updateRes.status !== 200) throw new Error(`Failed to update consumer profile: ${updateRes.status}`);
    
    // Verify immediate persistence in DB
    const refreshedConsumer = await fetch(`${baseUrl}/api/consumer/profile`, {
      headers: { Authorization: `Bearer ${consumerToken}` },
    });
    const refreshedData: any = (await refreshedConsumer.json() as any).data;
    if (refreshedData.name !== 'Rahul K. Sharma') throw new Error(`Name did not update in DB: got ${refreshedData.name}`);
    if (refreshedData.location !== 'Whitefield, Bengaluru') throw new Error(`Location did not update: got ${refreshedData.location}`);
    console.log('✓ PASS: Consumer profile update persisted and reflected immediately');

    // Provider update
    const provUpdateRes = await fetch(`${baseUrl}/api/provider/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Rajesh Pro Services',
        bio: 'Updated bio for testing',
      }),
    });
    if (provUpdateRes.status !== 200) throw new Error(`Failed to update provider profile: ${provUpdateRes.status}`);
    const provUpdatedData: any = (await provUpdateRes.json() as any).data;
    if (provUpdatedData.name !== 'Rajesh Pro Services') throw new Error(`Provider name not updated`);
    if (provUpdatedData.initials !== 'RS') throw new Error(`Initials not recalculated, expected 'RS', got '${provUpdatedData.initials}'`);
    console.log('✓ PASS: Provider profile update persisted and initials recalculated to RS');

    // ─── TEST SCENARIO 4: Account Isolation & Account Switching ───────────────
    console.log('\n--- Scenario 4: Account Isolation & Zero Data Leakage ---');
    const userTwoRes = await fetch(`${baseUrl}/api/consumer/profile`, {
      headers: { Authorization: `Bearer ${consumerTwoToken}` },
    });
    const userTwoData: any = (await userTwoRes.json() as any).data;
    if (userTwoData.name !== 'Amit Kumar') throw new Error(`Expected Amit Kumar, got ${userTwoData.name}`);
    if (userTwoData.email !== 'test.consumer.two@example.com') throw new Error(`Data leakage: unexpected email ${userTwoData.email}`);
    if (userTwoData.name === refreshedData.name) throw new Error('Account cross-contamination detected');
    console.log('✓ PASS: Distinct accounts return completely isolated user profiles');

    console.log('\n======================================================');
    console.log('🎉 ALL REAL USER DATA INTEGRATION TESTS PASSED (100%)');
    console.log('======================================================\n');
  } finally {
    // Clean up test documents
    await User.deleteMany({
      email: { $in: ['test.consumer.real@example.com', 'test.provider.real@example.com', 'test.consumer.two@example.com'] },
    });
    await Provider.deleteMany({
      email: { $in: ['test.provider.real@example.com'] },
    });
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
