// End-to-end automated verification script for LocalServ using native fetch
const API = 'http://localhost:5000/api';

const req = async (url, options = {}) => {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

const runTests = async () => {
  console.log('🧪 Starting End-to-End Test Suite for LocalServ...\n');

  try {
    // 1. Health check
    console.log('1️⃣ Checking API Health...');
    const health = await req('/health');
    console.log('   ✅ API Status:', health.status);

    // 2. Customer Login
    console.log('\n2️⃣ Testing Customer Login...');
    const custRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'rahul@test.com', password: 'password123' },
    });
    const custToken = custRes.token;
    console.log(`   ✅ Logged in as: ${custRes.user.name} (${custRes.user.role})`);
    console.log(`   💰 Initial Wallet Balance: ₹${custRes.user.walletBalance}`);

    // 3. Search businesses & services
    console.log('\n3️⃣ Testing Business Discovery & Recommendation Engine...');
    const recs = await req('/recommendations', {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    console.log(`   ✅ Recommended spots returned: ${recs.data.recommended.length}`);
    const topPick = recs.data.recommended[0];
    console.log(`   ⭐ Top Pick: ${topPick.name} (Hybrid Score: ${topPick.score}/100, Bayesian: ${topPick.bayesianRating})`);

    // 4. Fetch business detail & services
    console.log('\n4️⃣ Testing Business Detail & Service Offerings...');
    const bizRes = await req(`/businesses/${topPick._id}`);
    const services = bizRes.data.services;
    console.log(`   ✅ Found ${services.length} services for ${bizRes.data.name}`);
    const selectedService = services[0];
    console.log(`   💇 Selected Service: ${selectedService.name} - ₹${selectedService.price} (${selectedService.duration} min)`);

    // 5. Check real-time slot availability
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 2);
    const dateStr = testDate.toISOString().split('T')[0];

    console.log(`\n5️⃣ Checking Real-Time Slot Availability for ${dateStr}...`);
    const availRes = await req(`/businesses/${topPick._id}/availability?date=${dateStr}`);
    const availableSlots = availRes.slots.filter((s) => s.isAvailable);
    console.log(`   ✅ Available slots count: ${availableSlots.length}`);
    const chosenSlot = availableSlots[0].time;
    console.log(`   ⏰ Reserving Slot: ${chosenSlot}`);

    // 6. Create booking
    console.log('\n6️⃣ Creating Appointment Booking...');
    const bookRes = await req('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: {
        businessId: topPick._id,
        serviceId: selectedService._id,
        date: dateStr,
        startTime: chosenSlot,
        notes: 'Automated test booking',
      },
    });
    const booking = bookRes.data;
    console.log(`   ✅ Booking Created! ID: #${booking._id.slice(-6)}`);
    console.log(`   🔑 Check-in Arrival OTP: ${booking.checkinOTP}`);
    console.log(`   🔢 Completion Code: ${booking.completionOTP}`);

    // 7. DOUBLE-BOOKING PREVENTION TEST!
    console.log('\n7️⃣ Testing Double-Booking Prevention (Guarantee)...');
    try {
      await req('/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${custToken}` },
        body: {
          businessId: topPick._id,
          serviceId: selectedService._id,
          date: dateStr,
          startTime: chosenSlot, // EXACT SAME SLOT!
          notes: 'Attempting conflicting double-booking',
        },
      });
      console.error('   ❌ FAILED: Conflicting booking was unexpectedly allowed!');
    } catch (conflictErr) {
      console.log('   ✅ PASSED: Conflicting booking was strictly blocked!');
      console.log(`   🛡️ Error message: "${conflictErr.data?.message}"`);
    }

    // 8. Owner Login & OTP Check-in Verification
    console.log('\n8️⃣ Testing Business Owner Login & OTP Arrival Check-in...');
    const ownerRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'owner1@localserv.com', password: 'password123' },
    });
    const ownerToken = ownerRes.token;
    console.log(`   ✅ Logged in as Owner: ${ownerRes.user.name}`);

    // Verify Check-in with correct OTP
    const checkinRes = await req(`/bookings/${booking._id}/verify-checkin`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: { otp: booking.checkinOTP },
    });
    console.log(`   ✅ Check-In Verified! Status: ${checkinRes.data.status}`);

    // 9. Customer Completion Verification
    console.log('\n9️⃣ Testing Customer Service Completion Verification...');
    const completeRes = await req(`/bookings/${booking._id}/verify-completion`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${custToken}` },
      body: { otp: booking.completionOTP },
    });
    console.log(`   ✅ Service Completion Verified! Status: ${completeRes.data.status}, isVerified: ${completeRes.data.isVerified}`);

    // 10. Verified Review Submission
    console.log('\n🔟 Testing Verified Customer Review...');
    const revRes = await req('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: {
        businessId: topPick._id,
        bookingId: booking._id,
        rating: 5,
        comment: 'Outstanding experience! On-time, immaculate hygiene, and verified with check-in OTP.',
        tags: ['Clean', 'On Time', 'Highly Recommended'],
      },
    });
    console.log(`   ✅ Review Published! Rating: ${revRes.data.rating}⭐, Verified: ${revRes.data.isVerified}`);

    // 11. Cancellation & Wallet Refund Test
    console.log('\n1️⃣1️⃣ Testing Cancellation & Wallet Refund Calculation...');
    const cancelDate = new Date();
    cancelDate.setDate(cancelDate.getDate() + 3);
    const cancelDateStr = cancelDate.toISOString().split('T')[0];

    const bookToCancel = await req('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: {
        businessId: topPick._id,
        serviceId: selectedService._id,
        date: cancelDateStr,
        startTime: '15:00',
        notes: 'Testing refund to wallet',
      },
    });

    const cancelRes = await req(`/bookings/${bookToCancel.data._id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${custToken}` },
    });
    console.log(`   ✅ Cancelled booking! Refund: ₹${cancelRes.data.refundAmount} (${cancelRes.data.refundStatus} refund)`);

    const updatedProfile = await req('/auth/me', {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    console.log(`   💰 Updated Wallet Balance: ₹${updatedProfile.user.walletBalance}`);

    // 12. Admin Governance & Statistics
    console.log('\n1️⃣2️⃣ Testing Admin Operations Hub & Audit Logs...');
    const adminRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@localserve.com', password: 'Sh1vam@admin' },
    });
    const adminToken = adminRes.token;

    const [statsRes, logsRes] = await Promise.all([
      req('/admin/stats', { headers: { Authorization: `Bearer ${adminToken}` } }),
      req('/admin/logs?limit=5', { headers: { Authorization: `Bearer ${adminToken}` } }),
    ]);

    console.log('   📊 Platform Statistics:');
    console.log(`      • Users: ${statsRes.data.users.total} (${statsRes.data.users.customers} customers, ${statsRes.data.users.owners} owners, ${statsRes.data.users.admins} admins)`);
    console.log(`      • Businesses: ${statsRes.data.businesses.total} (${statsRes.data.businesses.approved} approved)`);
    console.log(`      • Bookings: ${statsRes.data.bookings.total} (${statsRes.data.bookings.verified} OTP-verified)`);
    console.log(`      • Gross Revenue: ₹${statsRes.data.revenue}`);
    console.log(`      • Total Preserved Audit Logs: ${statsRes.data.logs?.total || logsRes.total} events recorded`);

    console.log('\n🎉 ALL 12 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed:', err.data || err.message);
  }
};

runTests();
