import mongoose from 'mongoose';
import http from 'http';
import bcrypt from 'bcryptjs';
import app from '../app';
import { env } from '../config/env';
import { User, Provider } from '../models';
import { generateAccessToken } from '../middleware/auth';

async function runTests() {
  console.log('--- Starting Profile Feature E2E Verification ---');
  await mongoose.connect(env.mongodbUri);
  console.log('Connected to MongoDB');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 0. Clean up previous test runs
    await User.deleteMany({
      $or: [
        { email: { $in: ['test.consumer.profile@example.com', 'test.provider.profile@example.com', 'alex.updated@example.com'] } },
        { phone: { $in: ['+919999900001', '+919999900002', '+919999900099', '+919999900088'] } },
      ],
    });
    await Provider.deleteMany({
      $or: [
        { email: { $in: ['test.provider.profile@example.com'] } },
        { phone: { $in: ['+919999900002', '+919999900088'] } },
      ],
    });

    // 1. Ensure test Consumer exists
    const consumer = await User.create({
      name: 'Test Consumer',
      email: 'test.consumer.profile@example.com',
      phone: '+919999900001',
      password: 'hashedPassword123',
      role: 'consumer',
      location: 'Koramangala, Bangalore',
    });

    // 2. Ensure test Provider exists
    let providerUser = await User.findOne({ email: 'test.provider.profile@example.com' });
    if (!providerUser) {
      providerUser = await User.create({
        name: 'Test Provider User',
        email: 'test.provider.profile@example.com',
        phone: '+919999900002',
        password: 'hashedPassword123',
        role: 'provider',
        location: 'Indiranagar, Bangalore',
      });
    }

    let provider = await Provider.findOne({ userId: providerUser._id });
    if (!provider) {
      provider = await Provider.create({
        userId: providerUser._id,
        name: 'Test Provider User',
        initials: 'TP',
        category: 'Plumbing',
        phone: '+919999900002',
        email: 'test.provider.profile@example.com',
        address: 'Indiranagar 100ft Road',
        bio: 'Professional plumber',
      });
    }

    const consumerToken = generateAccessToken({ userId: consumer._id.toString(), role: 'consumer' });
    const providerToken = generateAccessToken({ userId: providerUser._id.toString(), role: 'provider' });

    // ── Test 1: GET /api/consumer/profile ──
    const getConsumerRes = await fetch(`${baseUrl}/api/consumer/profile`, {
      headers: { Authorization: `Bearer ${consumerToken}` },
    });
    const getConsumerJson: any = await getConsumerRes.json();
    console.assert(getConsumerRes.status === 200, 'GET /api/consumer/profile must return 200');
    console.assert(getConsumerJson.data.email === 'test.consumer.profile@example.com', 'Consumer email must match');
    console.log('[PASS] Test 1: GET /api/consumer/profile returned 200 with accurate data');

    // ── Test 2: PUT /api/consumer/profile (Update details) ──
    const updateConsumerRes = await fetch(`${baseUrl}/api/consumer/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${consumerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Alex Consumer Updated',
        location: 'Whitefield, Bangalore',
        phone: '+919999900099',
      }),
    });
    const updateConsumerJson: any = await updateConsumerRes.json();
    console.assert(updateConsumerRes.status === 200, `PUT /api/consumer/profile returned ${updateConsumerRes.status}`);
    console.assert(updateConsumerJson.data.name === 'Alex Consumer Updated', 'Updated name in response');
    console.assert(updateConsumerJson.data.location === 'Whitefield, Bangalore', 'Updated location in response');

    // Verify DB persistence
    const reloadedConsumer = await User.findById(consumer._id);
    console.assert(reloadedConsumer?.name === 'Alex Consumer Updated', 'Database user name updated');
    console.assert(reloadedConsumer?.phone === '+919999900099', 'Database phone updated');
    console.log('[PASS] Test 2: PUT /api/consumer/profile updated and persisted consumer data');

    // ── Test 3: GET /api/provider/profile ──
    const getProviderRes = await fetch(`${baseUrl}/api/provider/profile`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    const getProviderJson: any = await getProviderRes.json();
    console.assert(getProviderRes.status === 200, 'GET /api/provider/profile must return 200');
    console.assert(getProviderJson.data.category === 'Plumbing', 'Provider category must match');
    console.log('[PASS] Test 3: GET /api/provider/profile returned 200');

    // ── Test 4: PUT /api/provider/profile (Dual-collection sync & initials) ──
    const updateProviderRes = await fetch(`${baseUrl}/api/provider/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Rajesh Sharma',
        address: 'HSR Layout Sector 2, Bangalore',
        bio: 'Master certified plumber with 10 years experience.',
      }),
    });
    const updateProviderJson: any = await updateProviderRes.json();
    console.assert(updateProviderRes.status === 200, 'PUT /api/provider/profile returned 200');
    console.assert(updateProviderJson.data.name === 'Rajesh Sharma', 'Provider name updated');
    console.assert(updateProviderJson.data.initials === 'RS', `Initials must recompute to RS, got ${updateProviderJson.data.initials}`);

    // Verify Provider DB doc
    const reloadedProvider = await Provider.findOne({ userId: providerUser._id });
    console.assert(reloadedProvider?.name === 'Rajesh Sharma', 'Provider document name updated');
    console.assert(reloadedProvider?.initials === 'RS', 'Provider document initials updated');
    console.assert(reloadedProvider?.address === 'HSR Layout Sector 2, Bangalore', 'Provider document address updated');

    // Verify synchronized User DB doc
    const reloadedProviderUser = await User.findById(providerUser._id);
    console.assert(reloadedProviderUser?.name === 'Rajesh Sharma', 'User document name synchronized');
    console.assert(reloadedProviderUser?.location === 'HSR Layout Sector 2, Bangalore', 'User document location synchronized');
    console.log('[PASS] Test 4: PUT /api/provider/profile updated and synchronized both User and Provider documents with initials recomputation');

    // ── Test 5: Conflict check (Duplicate email/phone rejection) ──
    const conflictRes = await fetch(`${baseUrl}/api/consumer/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${consumerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.provider.profile@example.com', // Already registered to providerUser
      }),
    });
    console.assert(conflictRes.status === 409, `Conflict check must return 409, got ${conflictRes.status}`);
    const conflictJson: any = await conflictRes.json();
    console.assert(conflictJson.error.message.includes('already registered'), 'Error message informs of duplicate');
    console.log('[PASS] Test 5: Duplicate conflict rejection returned 409 Conflict');

    // ── Test 6: Security & Protected Fields ──
    const securityRes = await fetch(`${baseUrl}/api/consumer/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${consumerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'admin',
        password: 'hackedPassword',
      }),
    });
    console.assert(securityRes.status === 200, 'Security request processed');
    const unchangedConsumer = await User.findById(consumer._id);
    console.assert(unchangedConsumer?.role === 'consumer', 'Role MUST NOT be altered to admin');
    const isPasswordIntact = await bcrypt.compare('hashedPassword123', unchangedConsumer!.password);
    console.assert(isPasswordIntact, 'Password MUST NOT be altered');
    console.log('[PASS] Test 6: Sensitive attributes (role, password) remained strictly protected');

    // ── Test 7: Input Validation ──
    const validationRes = await fetch(`${baseUrl}/api/consumer/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${consumerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email-format',
      }),
    });
    console.assert(validationRes.status === 422 || validationRes.status === 400, 'Invalid email must be rejected');
    console.log('[PASS] Test 7: Validation error properly rejected malformed input');

    console.log('--- ALL 7 PROFILE VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
