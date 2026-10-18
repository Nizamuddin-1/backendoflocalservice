import mongoose from 'mongoose';
import http from 'http';
import app from '../app';
import { env } from '../config/env';
import { User, Provider, Service, ServiceCategory, Booking } from '../models';
import { generateAccessToken } from '../middleware/auth';

async function runTests() {
  console.log('--- Starting Booking Flow Feature E2E Verification ---');
  await mongoose.connect(env.mongodbUri);
  console.log('Connected to MongoDB');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 0. Clean up test records
    await Booking.deleteMany({
      serviceName: { $in: ['E2E AC Master Service', 'E2E AC Decline Test'] },
    });
    await Service.deleteMany({ name: { $in: ['E2E AC Master Service', 'E2E AC Decline Test'] } });
    await ServiceCategory.deleteMany({ name: 'E2E AC Repair' });
    await User.deleteMany({
      email: {
        $in: [
          'test.consumer.booking@example.com',
          'test.provider.a@example.com',
          'test.provider.b@example.com',
        ],
      },
    });
    await Provider.deleteMany({
      email: { $in: ['test.provider.a@example.com', 'test.provider.b@example.com'] },
    });

    // 1. Create Test Consumer
    const consumer = await User.create({
      name: 'Rohan Sharma',
      email: 'test.consumer.booking@example.com',
      phone: '+919876500001',
      password: 'hashedPassword123',
      role: 'consumer',
      location: 'Indiranagar, Bengaluru',
    });
    const consumerToken = generateAccessToken({
      userId: consumer._id.toString(),
      role: 'consumer',
    });

    // 2. Create Matching Provider A (AC Repair)
    const providerUserA = await User.create({
      name: 'Rajesh AC Pro',
      email: 'test.provider.a@example.com',
      phone: '+919876500002',
      password: 'hashedPassword123',
      role: 'provider',
      location: 'Domlur, Bengaluru',
    });
    const providerA = await Provider.create({
      userId: providerUserA._id,
      name: 'Cool Air Solutions',
      category: 'AC Repair',
      serviceCategories: ['AC Repair'],
      rating: 4.8,
      reviewCount: 24,
      jobsDone: 50,
      totalEarned: 75000,
      email: 'test.provider.a@example.com',
      phone: '+919876500002',
      address: 'Domlur, Bengaluru',
      initials: 'CA',
      isAvailable: true,
    });
    const providerAToken = generateAccessToken({
      userId: providerUserA._id.toString(),
      role: 'provider',
    });

    // 3. Create Unrelated Provider B (Plumbing)
    const providerUserB = await User.create({
      name: 'Suresh Plumber',
      email: 'test.provider.b@example.com',
      phone: '+919876500003',
      password: 'hashedPassword123',
      role: 'provider',
      location: 'Koramangala, Bengaluru',
    });
    const providerB = await Provider.create({
      userId: providerUserB._id,
      name: 'Flow Plumbing Services',
      category: 'Plumbing',
      serviceCategories: ['Plumbing'],
      rating: 4.6,
      reviewCount: 12,
      jobsDone: 30,
      totalEarned: 40000,
      email: 'test.provider.b@example.com',
      phone: '+919876500003',
      address: 'Koramangala, Bengaluru',
      initials: 'FP',
      isAvailable: true,
    });
    const providerBToken = generateAccessToken({
      userId: providerUserB._id.toString(),
      role: 'provider',
    });

    // 4. Create Category and Service linked to Provider A
    const category = await ServiceCategory.create({
      name: 'E2E AC Repair',
      slug: 'e2e-ac-repair',
      icon: 'wind',
      color: '#6366F1',
      bg: '#EEF2FF',
      proCount: 1,
    });

    const service = await Service.create({
      name: 'E2E AC Master Service',
      categoryId: category._id,
      categoryLabel: 'AC Repair',
      provider: providerA.name,
      providerInitials: providerA.initials,
      providerUserId: providerUserA._id,
      rating: 4.9,
      reviews: 30,
      price: 1499,
      originalPrice: 1999,
      accentColor: '#6366F1',
      accentBg: '#EEF2FF',
      mcIcon: 'air-conditioner',
      eta: '45 mins',
      shortDesc: 'Deep cleaning and service for all AC units',
      verified: true,
      popular: true,
      status: 'active',
    });

    console.log('✓ Test seed data created successfully');

    // ─── Test 1: Consumer Creates Booking ──────────────────────────────────
    console.log('\n--- Test 1: Consumer Books Service ---');
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1);

    const createRes = await fetch(`${baseUrl}/api/consumer/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consumerToken}`,
      },
      body: JSON.stringify({
        serviceId: service._id.toString(),
        scheduledAt: scheduledDate.toISOString(),
        address: '100 Feet Rd, Indiranagar, Bengaluru',
        city: 'Bengaluru',
      }),
    });

    const createJson: any = await createRes.json();
    console.log('Create booking response status:', createRes.status);
    if (createRes.status !== 201) {
      throw new Error(`Failed to create booking: ${JSON.stringify(createJson)}`);
    }

    const createdBooking = createJson.data;
    console.log(`✓ Booking created with ID: ${createdBooking._id}, ref: ${createdBooking.bookingRef}`);
    console.log(`✓ Auto-derived providerId: ${createdBooking.providerId}`);
    if (createdBooking.providerId !== providerA._id.toString()) {
      throw new Error(`Expected providerId ${providerA._id}, got ${createdBooking.providerId}`);
    }
    if (createdBooking.providerStatus !== 'new') {
      throw new Error(`Expected providerStatus 'new', got ${createdBooking.providerStatus}`);
    }

    // ─── Test 2: Consumer Views Bookings ───────────────────────────────────
    console.log('\n--- Test 2: Consumer Gets Bookings List ---');
    const consumerBookingsRes = await fetch(`${baseUrl}/api/consumer/bookings`, {
      headers: { Authorization: `Bearer ${consumerToken}` },
    });
    const consumerBookingsJson: any = await consumerBookingsRes.json();
    console.log('Consumer bookings count:', consumerBookingsJson.data.length);
    const foundBooking = consumerBookingsJson.data.find((b: any) => b._id === createdBooking._id);
    if (!foundBooking) {
      throw new Error('Created booking not found in consumer bookings list');
    }
    console.log('✓ Found booking in consumer list:', foundBooking.serviceName);

    // ─── Test 3: Provider A (Matching) Receives Booking ───────────────────
    console.log('\n--- Test 3: Provider A Receives Booking ---');
    const providerABookingsRes = await fetch(`${baseUrl}/api/provider/bookings`, {
      headers: { Authorization: `Bearer ${providerAToken}` },
    });
    const providerABookingsJson: any = await providerABookingsRes.json();
    const providerABooking = providerABookingsJson.data.find(
      (b: any) => b._id === createdBooking._id
    );
    if (!providerABooking) {
      throw new Error('Booking did NOT show up in Provider A incoming bookings list');
    }
    console.log('✓ Matching Provider A received the booking!');
    console.log('  Customer name:', providerABooking.customer.name);
    console.log('  Customer phone:', providerABooking.customer.phone);
    console.log('  Provider status:', providerABooking.providerStatus);

    // ─── Test 4: Provider B (Unrelated) Isolation Check ───────────────────
    console.log('\n--- Test 4: Provider B Isolation Verification ---');
    const providerBBookingsRes = await fetch(`${baseUrl}/api/provider/bookings`, {
      headers: { Authorization: `Bearer ${providerBToken}` },
    });
    const providerBBookingsJson: any = await providerBBookingsRes.json();
    const leakedBooking = providerBBookingsJson.data.find(
      (b: any) => b._id === createdBooking._id
    );
    if (leakedBooking) {
      throw new Error('SECURITY VIOLATION: Booking leaked to unrelated Provider B!');
    }
    console.log('✓ Provider B list is completely isolated (0 leaked bookings)');

    // ─── Test 5: Provider A Accepts Booking ───────────────────────────────
    console.log('\n--- Test 5: Provider A Accepts Booking ---');
    const acceptRes = await fetch(
      `${baseUrl}/api/provider/bookings/${createdBooking._id}/accept`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${providerAToken}` },
      }
    );
    const acceptJson: any = await acceptRes.json();
    console.log('Accept response status:', acceptRes.status);
    if (acceptRes.status !== 200) {
      throw new Error(`Failed to accept booking: ${JSON.stringify(acceptJson)}`);
    }
    if (acceptJson.data.providerStatus !== 'active' || acceptJson.data.status !== 'ongoing') {
      throw new Error(
        `Unexpected statuses after accept: providerStatus=${acceptJson.data.providerStatus}, status=${acceptJson.data.status}`
      );
    }
    console.log('✓ Booking transitioned to active/ongoing');

    // ─── Test 6: Provider A Completes Job ─────────────────────────────────
    console.log('\n--- Test 6: Provider A Completes Job ---');
    const completeRes = await fetch(
      `${baseUrl}/api/provider/bookings/${createdBooking._id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${providerAToken}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      }
    );
    const completeJson: any = await completeRes.json();
    console.log('Complete response status:', completeRes.status);
    if (completeRes.status !== 200) {
      throw new Error(`Failed to complete job: ${JSON.stringify(completeJson)}`);
    }
    if (completeJson.data.status !== 'completed' || completeJson.data.providerStatus !== 'done') {
      throw new Error(`Expected completed/done status, got: ${JSON.stringify(completeJson.data)}`);
    }
    console.log('✓ Job completed successfully');

    // Verify Provider stats updated
    const updatedProviderA = await Provider.findById(providerA._id);
    if (!updatedProviderA || updatedProviderA.jobsDone !== providerA.jobsDone + 1) {
      throw new Error(
        `Provider jobsDone expected ${providerA.jobsDone + 1}, got ${updatedProviderA?.jobsDone}`
      );
    }
    console.log(`✓ Provider jobsDone updated: ${updatedProviderA.jobsDone}`);

    // ─── Test 7: Decline Flow Verification ────────────────────────────────
    console.log('\n--- Test 7: Provider Declines Booking Flow ---');
    const createRes2 = await fetch(`${baseUrl}/api/consumer/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consumerToken}`,
      },
      body: JSON.stringify({
        serviceId: service._id.toString(),
        scheduledAt: scheduledDate.toISOString(),
        address: '100 Feet Rd, Indiranagar, Bengaluru',
      }),
    });
    const booking2 = (await createRes2.json() as any).data;

    const declineRes = await fetch(
      `${baseUrl}/api/provider/bookings/${booking2._id}/decline`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${providerAToken}` },
      }
    );
    const declineJson: any = await declineRes.json();
    console.log('Decline response status:', declineRes.status);
    if (declineRes.status !== 200) {
      throw new Error(`Failed to decline booking: ${JSON.stringify(declineJson)}`);
    }
    if (declineJson.data.status !== 'cancelled' || declineJson.data.providerStatus !== 'cancelled') {
      throw new Error(`Expected cancelled status, got: ${JSON.stringify(declineJson.data)}`);
    }
    console.log('✓ Booking declined and transitioned to cancelled');

    console.log('\n======================================================');
    console.log('🎉 ALL BOOKING FLOW E2E TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
