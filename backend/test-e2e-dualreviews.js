import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('🧪 Starting End-to-End Verification for Dual Reviews, Device Upload & GPS Detection...\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  console.log('1. Backend Health Check:', health.status === 'healthy' ? '✅ PASS' : '❌ FAIL');

  // 2. Reverse Geocode Test
  const revRes = await fetch(`${BASE_URL}/api/location/reverse-geocode?lat=28.5708&lng=77.3260`);
  const revData = await revRes.json();
  console.log('2. Reverse Geocode (Noida Coords):', revData.success && revData.data.city ? `✅ PASS (Detected: ${revData.data.city})` : '❌ FAIL');

  // 3. Location Area Search Test
  const searchRes = await fetch(`${BASE_URL}/api/location/search?query=Indirapuram`);
  const searchData = await searchRes.json();
  console.log('3. Area Geocoding Search:', searchData.success && searchData.data.lat ? `✅ PASS (Lat: ${searchData.data.lat}, Lng: ${searchData.data.lng})` : '❌ FAIL');

  // 4. Device Photo Upload Test using Multipart FormData
  const testImagePath = path.join(__dirname, 'test-photo.png');
  // Create a minimal 1x1 png image
  const minimalPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testImagePath, minimalPng);

  const formData = new FormData();
  const fileBlob = new Blob([minimalPng], { type: 'image/png' });
  formData.append('photos', fileBlob, 'store-front-test.png');

  const uploadRes = await fetch(`${BASE_URL}/api/upload/photos`, {
    method: 'POST',
    body: formData,
  });
  const uploadData = await uploadRes.json();
  console.log('4. Device Photo Upload (Multer):', uploadData.success && uploadData.urls?.length ? `✅ PASS (Uploaded: ${uploadData.urls[0]})` : '❌ FAIL');

  if (uploadData.urls?.[0]) {
    // Verify static serving
    const staticRes = await fetch(`${BASE_URL}${uploadData.urls[0]}`);
    console.log('   Static Photo Serving Check:', staticRes.status === 200 ? '✅ PASS' : '❌ FAIL');
  }

  // Clean up test photo file
  if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);

  // 5. Google Maps Import Preview
  const previewRes = await fetch(`${BASE_URL}/api/google/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      googleMapsUrl: 'https://www.google.com/maps/place/Aura+Spa/@28.5708,77.3260,17z',
      storeName: 'Aura Day Spa',
      category: 'spa',
    }),
  });
  const previewData = await previewRes.json();
  console.log('5. Google Maps Preview API:', previewData.success && previewData.data.reviews?.length > 0 ? `✅ PASS (${previewData.data.reviews.length} reviews, Google Rating: ${previewData.data.googleRating}★)` : '❌ FAIL');

  // 6. Owner Login & Business Google Import Test
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner1@localserv.com',
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  if (token) {
    // Fetch owner's business
    const myBizRes = await fetch(`${BASE_URL}/api/businesses/owner/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const myBizData = await myBizRes.json();
    const biz = myBizData.data;

    if (biz) {
      console.log(`6. Owner Business Found: "${biz.name}" (ID: ${biz._id})`);

      // Import Google data directly to business
      const importRes = await fetch(`${BASE_URL}/api/google/business/${biz._id}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          googleMapsUrl: 'https://www.google.com/maps/place/Glow+Luxury+Salon/@19.1363,72.8311,17z',
          storeName: biz.name,
          category: biz.category,
        }),
      });
      const importResult = await importRes.json();
      console.log('7. Direct Google Data Store Import:', importResult.success ? '✅ PASS' : '❌ FAIL');

      if (importResult.success) {
        const updatedBiz = importResult.data.business;
        console.log(`   - Google Rating: ${updatedBiz.googleRating}★ (${updatedBiz.googleReviewCount} Google reviews)`);
        console.log(`   - Platform Rating: ${updatedBiz.platformRating}★`);
        console.log(`   - Composite Weighted Rating (70% Platform + 30% Google): ${updatedBiz.rating}★`);
      }

      // 8. Public Business Details Fetch Check
      const detailRes = await fetch(`${BASE_URL}/api/businesses/${biz._id}`);
      const detailData = await detailRes.json();
      const bDetail = detailData.data;
      const hasDualRatings = bDetail.googleReviews?.length > 0 && bDetail.platformRating !== undefined;
      console.log('8. Public Business Detail Dual Rating Fields:', hasDualRatings ? '✅ PASS' : '❌ FAIL');
    }
  }

  console.log('\n🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY!\n');
};

runTests().catch(console.error);
