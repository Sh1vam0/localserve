import User from '../models/User.js';
import Business from '../models/Business.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';

const photoPacks = {
  salon: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85', // Exterior & Entry
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=85', // Styling Stations
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=85', // Hair Wash & Lounge
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85', // Grooming Suite
  ],
  spa: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85', // Reception & Ambience
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=85', // Massage Suite
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=85', // Herbal Bath & Steam
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=85', // Aromatherapy Room
  ],
  gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85', // Front Cardio Floor
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85', // Free Weights & Power Racks
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=85', // CrossFit Arena
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=85', // Locker & Stretch Bay
  ],
  parlour: [
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=85', // Entrance & Reception
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85', // Bridal Makeup Studio
    'https://images.unsplash.com/photo-1512290900672-1f417439589d?auto=format&fit=crop&w=1000&q=85', // Facial & Skincare Room
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1000&q=85', // Nail Art Bar
  ],
  wellness: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=85', // Studio Entrance
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=85', // Meditation Hall
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=85', // Yoga Deck
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85', // Sound Therapy Suite
  ],
};

const makeGoogleMapsUrl = (name, street, city) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, street, city].filter(Boolean).join(' '))}`;

const seedGoogleReviewsByCategory = {
  salon: [
    {
      authorName: 'Rohan Mehra',
      rating: 5,
      text: 'Superb haircuts and beard styling! The master stylist gave great advice on what suited my face cut. Booking an appointment was completely hassle-free.',
      relativeTime: '2 weeks ago',
      isLocalGuide: true,
      reviewCount: 42,
    },
    {
      authorName: 'Sneha Kapur',
      rating: 5,
      text: 'Got my keratin hair spa done here. Hair feels super silky and soft! The hygiene protocol is top notch and they sanitize every tool in front of you.',
      relativeTime: '1 month ago',
      isLocalGuide: false,
      reviewCount: 8,
    },
    {
      authorName: 'Arjun Singhal',
      rating: 4,
      text: 'Great ambiance and polite staff. Slightly busy on weekends so definitely recommend booking your slot in advance. Will be visiting regularly.',
      relativeTime: '3 weeks ago',
      isLocalGuide: true,
      reviewCount: 19,
    },
    {
      authorName: 'Pooja Nair',
      rating: 5,
      text: 'Wonderful experience! The scalp massage during hair wash was heavenly. Very modern salon with well-maintained equipment.',
      relativeTime: '2 months ago',
      isLocalGuide: false,
      reviewCount: 5,
    },
  ],
  spa: [
    {
      authorName: 'Dr. Neha Verma',
      rating: 5,
      text: 'The Swedish deep tissue massage and steam bath completely melted my work stress away. The therapists are certified and extremely professional.',
      relativeTime: '10 days ago',
      isLocalGuide: true,
      reviewCount: 54,
    },
    {
      authorName: 'Vikramaditya Roy',
      rating: 5,
      text: 'A pure haven of tranquility. The aromatherapy oils they use are authentic organic extracts. Very peaceful ambience and welcoming reception.',
      relativeTime: '3 weeks ago',
      isLocalGuide: false,
      reviewCount: 12,
    },
    {
      authorName: 'Aditi Chawla',
      rating: 4,
      text: 'Loved the Balinese body wrap and herbal bath. Pristine rooms with private shower. Excellent place for weekend rejuvenation.',
      relativeTime: '1 month ago',
      isLocalGuide: true,
      reviewCount: 31,
    },
    {
      authorName: 'Kabir Oberoi',
      rating: 5,
      text: 'One of the finest wellness spas in the city. The ride assistance was super convenient to locate the exact drop-off entrance.',
      relativeTime: '2 months ago',
      isLocalGuide: false,
      reviewCount: 7,
    },
  ],
  gym: [
    {
      authorName: 'Karan Malhotra',
      rating: 5,
      text: 'Huge workout floor with top-of-the-line Eleiko and Life Fitness equipment. Certified trainers who actually correct your form rather than just pushing supplements.',
      relativeTime: '1 week ago',
      isLocalGuide: true,
      reviewCount: 67,
    },
    {
      authorName: 'Deepak Joshi',
      rating: 5,
      text: 'The CrossFit arena and functional training zone are unbeatable. Clean locker rooms, sauna, and positive energetic community vibe.',
      relativeTime: '3 weeks ago',
      isLocalGuide: false,
      reviewCount: 15,
    },
    {
      authorName: 'Sanjana Patel',
      rating: 4,
      text: 'Great gym with motivating group HIIT classes. Good crowd and spacious parking area available.',
      relativeTime: '1 month ago',
      isLocalGuide: true,
      reviewCount: 28,
    },
  ],
  parlour: [
    {
      authorName: 'Ananya Mukherjee',
      rating: 5,
      text: 'Booked my bridal makeup and pre-bridal skin package here. The results were breathtaking! Got so many compliments on my special day.',
      relativeTime: '2 weeks ago',
      isLocalGuide: true,
      reviewCount: 38,
    },
    {
      authorName: 'Meera Saxena',
      rating: 5,
      text: 'Their Hydra-facial gave my skin an instant natural glow. The beauticians are gentle, experienced, and very hygienic.',
      relativeTime: '1 month ago',
      isLocalGuide: false,
      reviewCount: 9,
    },
    {
      authorName: 'Tanvi Gokhale',
      rating: 4,
      text: 'Very welcoming environment and prompt service. Loved the nail extensions and Russian manicure art.',
      relativeTime: '6 weeks ago',
      isLocalGuide: false,
      reviewCount: 4,
    },
  ],
  wellness: [
    {
      authorName: 'Sunil Rao',
      rating: 5,
      text: 'The yoga instructors have profound knowledge of Hatha and Vinyasa flow. The meditation dome has such serene energy.',
      relativeTime: '2 weeks ago',
      isLocalGuide: true,
      reviewCount: 46,
    },
    {
      authorName: 'Divya Nambiar',
      rating: 5,
      text: 'Sound bath therapy was transformative! Relieved my chronic insomnia. Highly recommend attending their weekend workshops.',
      relativeTime: '1 month ago',
      isLocalGuide: false,
      reviewCount: 11,
    },
  ],
};

const autoSeed = async () => {
  try {
    let owner1 = await User.findOne({ email: 'owner1@localserv.com' });
    let owner2 = await User.findOne({ email: 'owner2@localserv.com' });
    let owner3 = await User.findOne({ email: 'owner3@localserv.com' });
    let ownerNCR = await User.findOne({ email: 'owner.ncr@localserv.com' });

    if (!owner1 || !owner2 || !owner3 || !ownerNCR) {
      console.log('🌱 Populating database with rich demo users...');

      // 1. Root Super Admin (if not present)
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        await User.create({
          name: 'Sh1vam',
          username: 'sh1vam',
          email: 'admin@localserve.com',
          password: 'Sh1vam@admin',
          phone: '+91 99999 88888',
          role: 'admin',
          isSuperAdmin: true,
          adminPermissions: {
            canVerifyBusinesses: true,
            canManageUsers: true,
            canManageBookings: true,
            canManageAdmins: true,
          },
        });
      }

      // 2. Owners
      if (!owner1) {
        owner1 = await User.create({
          name: 'Vikram Malhotra',
          email: 'owner1@localserv.com',
          password: 'password123',
          phone: '+91 98201 22334',
          role: 'owner',
        });
      }

      if (!owner2) {
        owner2 = await User.create({
          name: 'Ananya Sharma',
          email: 'owner2@localserv.com',
          password: 'password123',
          phone: '+91 98202 33445',
          role: 'owner',
        });
      }

      if (!owner3) {
        owner3 = await User.create({
          name: 'Rajesh Kulkarni',
          email: 'owner3@localserv.com',
          password: 'password123',
          phone: '+91 98203 44556',
          role: 'owner',
        });
      }

      if (!ownerNCR) {
        ownerNCR = await User.create({
          name: 'Rohit Bansal',
          email: 'owner.ncr@localserv.com',
          password: 'password123',
          phone: '+91 98110 99887',
          role: 'owner',
        });
      }
    }

    // 3. Customers
    let customer1 = await User.findOne({ email: 'rahul@test.com' });
    if (!customer1) {
      customer1 = await User.create({
        name: 'Rahul Verma',
        email: 'rahul@test.com',
        password: 'password123',
        phone: '+91 98111 55667',
        role: 'customer',
        walletBalance: 300,
        walletHistory: [
          { amount: 300, type: 'credit', reason: 'Refund for cancelled booking #9821' },
        ],
      });
    }

    let customer2 = await User.findOne({ email: 'priya@test.com' });
    if (!customer2) {
      customer2 = await User.create({
        name: 'Priya Patel',
        email: 'priya@test.com',
        password: 'password123',
        phone: '+91 98112 66778',
        role: 'customer',
        walletBalance: 0,
      });
    }

    const amitCustomer = await User.findOne({ email: 'amit@test.com' });
    if (!amitCustomer) {
      await User.create({
        name: 'Amit Deshmukh',
        email: 'amit@test.com',
        password: 'password123',
        phone: '+91 98113 77889',
        role: 'customer',
        walletBalance: 150,
        walletHistory: [
          { amount: 150, type: 'credit', reason: 'Promotional welcome credit' },
        ],
      });
    }

    // Helper to seed coupons with active time frames if not already present
    const seedCoupons = async () => {
      const couponCount = await Coupon.countDocuments();
      if (couponCount > 0) return;

      const adminUser = await User.findOne({ role: 'admin' });
      const glowBiz = await Business.findOne({ name: /Glow/i });
      const auraBiz = await Business.findOne({ name: /Aura/i });

      if (!adminUser) return;

      const now = new Date();
      const inOneYear = new Date();
      inOneYear.setFullYear(now.getFullYear() + 1);
      const inSixMonths = new Date();
      inSixMonths.setMonth(now.getMonth() + 6);
      const inThreeMonths = new Date();
      inThreeMonths.setMonth(now.getMonth() + 3);

      await Coupon.create([
        {
          code: 'WELCOME50',
          title: 'Platform Welcome Voucher',
          description: 'Flat ₹50 off on any booking across all verified stores on NearNest.',
          scope: 'platform',
          discountType: 'flat',
          discountValue: 50,
          minBookingAmount: 200,
          validFrom: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          validUntil: inOneYear,
          usageLimit: 500,
          usedCount: 14,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          code: 'FESTIVE20',
          title: 'Platform Festive Wellness Special',
          description: '20% off up to ₹250 on premium wellness and salon experiences across the website.',
          scope: 'platform',
          discountType: 'percentage',
          discountValue: 20,
          maxDiscountAmount: 250,
          minBookingAmount: 400,
          validFrom: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          validUntil: inSixMonths,
          usageLimit: 250,
          usedCount: 22,
          isActive: true,
          createdBy: adminUser._id,
        },
        ...(glowBiz
          ? [
              {
                code: 'GLOW25',
                title: 'Glow Salon VIP Styling 25% Off',
                description: 'Exclusive 25% discount on hair spa, cut, and facial treatments at Glow Luxury Salon.',
                scope: 'store',
                business: glowBiz._id,
                discountType: 'percentage',
                discountValue: 25,
                maxDiscountAmount: 150,
                minBookingAmount: 300,
                validFrom: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
                validUntil: inThreeMonths,
                usageLimit: 100,
                usedCount: 19,
                isActive: true,
                createdBy: glowBiz.owner,
              },
            ]
          : []),
        ...(auraBiz
          ? [
              {
                code: 'AURA100',
                title: 'Aura Day Spa Relax & Rejuvenate',
                description: 'Flat ₹100 discount on Swedish massages and aromatherapy stress relief sessions.',
                scope: 'store',
                business: auraBiz._id,
                discountType: 'flat',
                discountValue: 100,
                minBookingAmount: 800,
                validFrom: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
                validUntil: inThreeMonths,
                usageLimit: 80,
                usedCount: 12,
                isActive: true,
                createdBy: auraBiz.owner,
              },
            ]
          : []),
      ]);
      console.log('🎟️ Seeded platform-wide and store-specific promotional coupons with active time frames.');
    };

    // Check if businesses need seeding
    const multiPhotoBiz = await Business.findOne({ 'images.2': { $exists: true } });
    if (multiPhotoBiz) {
      console.log('ℹ️ Verified businesses with multiple photos already exist.');
      await seedCoupons();
      return;
    }

    console.log('📍 Seeding verified stores with 3+ photos and pinpoint location links...');
    await Business.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    // 1. Glow Luxury Salon
    const biz1 = await Business.create({
      owner: owner1._id,
      name: 'Glow Luxury Salon & Spa',
      category: 'salon',
      description: 'Premium hair styling, facials, and grooming services by certified master stylists in Andheri West.',
      phone: '+91 98201 99001',
      email: 'glow@salon.com',
      address: {
        street: 'Link Road, Near Infinity Mall, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
      },
      location: {
        type: 'Point',
        coordinates: [72.8311, 19.1363],
      },
      images: photoPacks.salon,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '27AABCG1234F1Z1',
        tradeLicense: 'BMC-TL-4819-2024',
        ownerIdType: 'Aadhaar Card',
        ownerIdNumber: 'XXXX-XXXX-9912',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Opposite Infinity Mall Gate 3, 1st Floor',
        googleMapsUrl: makeGoogleMapsUrl('Glow Luxury Salon & Spa', 'Link Road, Andheri West', 'Mumbai'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Dedicated Uber drop-off zone at main porch. Valet available.',
      rating: 4.8,
      reviewCount: 142,
      status: 'approved',
    });

    // 2. FitZone Elite
    const biz2 = await Business.create({
      owner: owner2._id,
      name: 'FitZone Elite Gym & CrossFit',
      category: 'gym',
      description: 'State-of-the-art strength equipment, certified personal trainers, HIIT and functional fitness.',
      phone: '+91 98202 99002',
      email: 'info@fitzone.com',
      address: {
        street: 'Hill Road, Near Mehboob Studio, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
      },
      location: {
        type: 'Point',
        coordinates: [72.8258, 19.0544],
      },
      images: photoPacks.gym,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '27AABCF5678F1Z2',
        tradeLicense: 'BMC-TL-9812-2024',
        ownerIdType: 'PAN Card',
        ownerIdNumber: 'ABCDE1234F',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Next to Mehboob Studio, Ground Floor Entry',
        googleMapsUrl: makeGoogleMapsUrl('FitZone Elite Gym', 'Hill Road, Bandra West', 'Mumbai'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Drop-off directly opposite Hill Road entrance.',
      rating: 4.7,
      reviewCount: 98,
      status: 'approved',
    });

    // 3. Serenity Spa
    const biz3 = await Business.create({
      owner: owner3._id,
      name: 'Serenity Ayurvedic Spa & Wellness',
      category: 'spa',
      description: 'Authentic holistic Kerala massages, soothing aromatherapy, steam baths and body scrubs.',
      phone: '+91 98203 99003',
      email: 'contact@serenityspa.com',
      address: {
        street: 'Juhu Tara Road, Opp Juhu Beach',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400049',
      },
      location: {
        type: 'Point',
        coordinates: [72.8267, 19.0988],
      },
      images: photoPacks.spa,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '27AABCS9012F1Z3',
        tradeLicense: 'BMC-AYUSH-3142-2024',
        ownerIdType: 'Passport',
        ownerIdNumber: 'Z8819241',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Near Juhu Beach Sea-face Promenade',
        googleMapsUrl: makeGoogleMapsUrl('Serenity Ayurvedic Spa', 'Juhu Tara Road', 'Mumbai'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Drop-off at beach boulevard entryway. Ola / Uber readily available.',
      rating: 4.9,
      reviewCount: 210,
      status: 'approved',
    });

    // 4. Style Studio
    const biz4 = await Business.create({
      owner: owner1._id,
      name: 'Style Studio Hair & Beard',
      category: 'salon',
      description: 'Modern trendy cuts, beard sculpting, keratin treatments and bridal styling in Powai.',
      phone: '+91 98201 99004',
      email: 'stylestudio@powai.com',
      address: {
        street: 'Hiranandani Gardens, Central Avenue, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400076',
      },
      location: {
        type: 'Point',
        coordinates: [72.9051, 19.1197],
      },
      images: photoPacks.salon,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '27AABCX4411F1Z4',
        tradeLicense: 'BMC-TL-7721-2024',
        ownerIdType: 'Aadhaar Card',
        ownerIdNumber: 'XXXX-XXXX-3341',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Central Avenue Galleria Mall, Shop 14',
        googleMapsUrl: makeGoogleMapsUrl('Style Studio Hair', 'Central Avenue, Powai', 'Mumbai'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Basement visitor parking and Uber pickup kiosk at gate 1.',
      rating: 4.6,
      reviewCount: 85,
      status: 'approved',
    });

    // 5. Zen Yoga
    const biz5 = await Business.create({
      owner: owner2._id,
      name: 'Zen Yoga & Wellness Sanctuary',
      category: 'wellness',
      description: 'Peaceful studio offering Ashtanga yoga, guided meditation, and sound healing sessions.',
      phone: '+91 98202 99005',
      email: 'om@zenwellness.com',
      address: {
        street: 'Colaba Causeway, Near Gateway of India',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
      location: {
        type: 'Point',
        coordinates: [72.8317, 18.9220],
      },
      images: photoPacks.wellness,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '27AABCZ8822F1Z5',
        tradeLicense: 'BMC-WELL-1102-2024',
        ownerIdType: 'PAN Card',
        ownerIdNumber: 'ZENYG9921K',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Behind Regal Cinema, 2nd Floor Studio',
        googleMapsUrl: makeGoogleMapsUrl('Zen Yoga Sanctuary', 'Colaba Causeway', 'Mumbai'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rating: 4.9,
      reviewCount: 64,
      status: 'approved',
    });

    // 6. Glamour Parlour
    const biz6 = await Business.create({
      owner: owner3._id,
      name: 'Glamour Beauty Parlour',
      category: 'parlour',
      description: 'Complete bridal makeover, waxing, organic facials, nail art and threading.',
      phone: '+91 98203 99006',
      email: 'glamour@parlour.com',
      address: {
        street: 'Ranade Road, Near Shivaji Park, Dadar West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400028',
      },
      location: {
        type: 'Point',
        coordinates: [72.8397, 19.0178],
      },
      images: photoPacks.parlour,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '27AABCP3319F1Z6',
        tradeLicense: 'BMC-TL-5512-2024',
        ownerIdType: 'Aadhaar Card',
        ownerIdNumber: 'XXXX-XXXX-7729',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Opposite Shivaji Park Gate 4',
        googleMapsUrl: makeGoogleMapsUrl('Glamour Beauty Parlour', 'Ranade Road, Dadar', 'Mumbai'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rating: 4.5,
      reviewCount: 115,
      status: 'approved',
    });

    // 7. Aura Luxury Day Spa (Noida Sector 18)
    const bizNoida1 = await Business.create({
      owner: ownerNCR._id,
      name: 'Aura Luxury Day Spa & Wellness',
      category: 'spa',
      description: 'Award-winning Swedish massages, body wraps, Balinese therapy, and aroma steam rooms in Noida Sector 18.',
      phone: '+91 98110 11001',
      email: 'aura.spa@noida.com',
      address: {
        street: 'Sector 18, Opp Wave Silver Tower, Near Metro Station',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
      },
      location: {
        type: 'Point',
        coordinates: [77.3260, 28.5708],
      },
      images: photoPacks.spa,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '09AABCA9911F1Z7',
        tradeLicense: 'NOIDA-SPA-2024-88',
        ownerIdType: 'Aadhaar Card',
        ownerIdNumber: 'XXXX-XXXX-1029',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Wave Silver Tower, 2nd Floor, Sector 18 Metro Gate 2',
        googleMapsUrl: makeGoogleMapsUrl('Aura Luxury Day Spa', 'Sector 18', 'Noida'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Direct drop-off at Wave Silver Tower main porch. Uber & Ola drivers can halt at drop lane 1.',
      rating: 4.9,
      reviewCount: 168,
      status: 'approved',
    });

    // 8. Toni & Guy (DLF Mall of India, Noida)
    const bizNoida2 = await Business.create({
      owner: ownerNCR._id,
      name: 'Toni & Guy Unisex Hair Salon',
      category: 'salon',
      description: 'International precision hairstyling, Olaplex treatments, balayage highlights, and executive grooming.',
      phone: '+91 98110 11002',
      email: 'toniandguy@dlfmall.com',
      address: {
        street: 'Level 2, DLF Mall of India, Sector 18',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
      },
      location: {
        type: 'Point',
        coordinates: [77.3209, 28.5672],
      },
      images: photoPacks.salon,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '09AABCT4411F1Z8',
        tradeLicense: 'DLF-COMM-441-2024',
        ownerIdType: 'PAN Card',
        ownerIdNumber: 'TONIG1124K',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Level 2 next to Zara, DLF Mall of India Gate 6',
        googleMapsUrl: makeGoogleMapsUrl('Toni & Guy Salon', 'DLF Mall of India, Sector 18', 'Noida'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Use Mall of India Gate 6 drop-off point for immediate escalator access to Level 2.',
      rating: 4.8,
      reviewCount: 220,
      status: 'approved',
    });

    // 9. Cult.fit Gym (Noida Sector 62)
    const bizNoida3 = await Business.create({
      owner: ownerNCR._id,
      name: 'Cult.fit Gym & CrossFit Hub',
      category: 'gym',
      description: 'High energy HIIT sessions, boxing conditioning, Olympic weightlifting and functional strength coaching.',
      phone: '+91 98110 11003',
      email: 'cult.sector62@noida.com',
      address: {
        street: 'C-Block, Near Electronic City Metro, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
      },
      location: {
        type: 'Point',
        coordinates: [77.3639, 28.6280],
      },
      images: photoPacks.gym,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '09AABCC1122F1Z9',
        tradeLicense: 'NOIDA-FIT-192-2024',
        ownerIdType: 'Aadhaar Card',
        ownerIdNumber: 'XXXX-XXXX-6511',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Opposite Electronic City Metro Gate 1, C-Block Commercial Hub',
        googleMapsUrl: makeGoogleMapsUrl('Cult.fit Gym', 'Sector 62', 'Noida'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Dedicated parking lot and quick Uber drop-off zone outside C-Block tower.',
      rating: 4.7,
      reviewCount: 135,
      status: 'approved',
    });

    // 10. Lotus Ayurvedic Spa (Pari Chowk, Greater Noida)
    const bizGrNoida1 = await Business.create({
      owner: ownerNCR._id,
      name: 'Lotus Ayurvedic Spa & Herbal Care',
      category: 'spa',
      description: 'Pure Panchakarma therapy, Kizhi herbal pouch massage, Shirodhara, and organic skin detoxification.',
      phone: '+91 98110 22001',
      email: 'lotus@grnoida.com',
      address: {
        street: 'Commercial Belt, Near Pari Chowk Roundabout',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        pincode: '201310',
      },
      location: {
        type: 'Point',
        coordinates: [77.5030, 28.4682],
      },
      images: photoPacks.spa,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '09AABCL7744F1Z0',
        tradeLicense: 'GNIDA-SPA-2024-11',
        ownerIdType: 'Aadhaar Card',
        ownerIdNumber: 'XXXX-XXXX-8822',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Commercial Belt Plaza 2, Pari Chowk Metro Station Gate 3',
        googleMapsUrl: makeGoogleMapsUrl('Lotus Ayurvedic Spa', 'Commercial Belt, Pari Chowk', 'Greater Noida'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Easy drop-off zone right before Pari Chowk flyover. Ample open parking space.',
      rating: 4.9,
      reviewCount: 92,
      status: 'approved',
    });

    // 11. O2 Fitness Hub (Knowledge Park III, Greater Noida)
    const bizGrNoida2 = await Business.create({
      owner: ownerNCR._id,
      name: 'O2 Fitness Arena & CrossFit Hub',
      category: 'gym',
      description: 'Multi-level gym with sauna, certified dieticians, powerlifting cages, and student discount passes.',
      phone: '+91 98110 22002',
      email: 'o2fitness@knowledgepark.com',
      address: {
        street: 'Plot 14, Knowledge Park III, Near Sharda University',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        pincode: '201310',
      },
      location: {
        type: 'Point',
        coordinates: [77.4947, 28.4601],
      },
      images: photoPacks.gym,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '09AABCO5533F1Z1',
        tradeLicense: 'GNIDA-GYM-991-2024',
        ownerIdType: 'PAN Card',
        ownerIdNumber: 'O2FIT8812M',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Plot 14 Boulevard, 500m from Sharda University Campus Gate',
        googleMapsUrl: makeGoogleMapsUrl('O2 Fitness Arena', 'Knowledge Park III', 'Greater Noida'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Direct drop-off at Knowledge Park 3 student boulevard. Ola Auto & Uber Moto easily available.',
      rating: 4.8,
      reviewCount: 110,
      status: 'approved',
    });

    // 12. Blush & Bloom Parlour (Alpha 1, Greater Noida)
    const bizGrNoida3 = await Business.create({
      owner: ownerNCR._id,
      name: 'Blush & Bloom Bridal Studio & Parlour',
      category: 'parlour',
      description: 'HD airbrush bridal makeup, Russian manicures, Hydra-facials, and pre-wedding grooming packages.',
      phone: '+91 98110 22003',
      email: 'blushbloom@alpha1.com',
      address: {
        street: 'Alpha 1 Commercial Complex, Near Alpha 1 Metro Station',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        pincode: '201310',
      },
      location: {
        type: 'Point',
        coordinates: [77.5145, 28.4735],
      },
      images: photoPacks.parlour,
      verificationStatus: 'verified',
      verificationDocuments: {
        gstin: '09AABCB9900F1Z2',
        tradeLicense: 'GNIDA-PARL-331-2024',
        ownerIdType: 'Aadhaar Card',
        ownerIdNumber: 'XXXX-XXXX-4419',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        verifiedAt: new Date(),
      },
      pinpointLocation: {
        landmark: 'Alpha 1 Commercial Complex Ground Floor, Gate A',
        googleMapsUrl: makeGoogleMapsUrl('Blush & Bloom Bridal Studio', 'Alpha 1 Commercial Complex', 'Greater Noida'),
        isPinpointConfirmed: true,
      },
      offersRideAssistance: true,
      rideNotes: 'Drop-off directly in front of Alpha 1 Commercial Plaza Gate A.',
      rating: 4.6,
      reviewCount: 78,
      status: 'approved',
    });

    // Populate Services for businesses
    const allBusinesses = [
      { biz: biz1, price: 350, name: 'Classic Signature Haircut & Wash' },
      { biz: biz2, price: 1500, name: 'Monthly Unlimited Gym Membership' },
      { biz: biz3, price: 1400, name: 'Ayurvedic Abhyanga Full Body Massage' },
      { biz: biz4, price: 450, name: 'Men Premium Cut & Charcoal Scrub' },
      { biz: biz5, price: 450, name: 'Hatha & Vinyasa Yoga Session' },
      { biz: biz6, price: 550, name: 'Fruit Glow Facial & De-Tan Therapy' },
      { biz: bizNoida1, price: 999, name: 'Aromatherapy Stress Relief Session' },
      { biz: bizNoida2, price: 450, name: 'Master Stylist Haircut & Blowout' },
      { biz: bizNoida3, price: 299, name: 'Cult Day Pass & Functional Workout' },
      { biz: bizGrNoida1, price: 899, name: 'Ayurvedic Abhyanga Massage' },
      { biz: bizGrNoida2, price: 799, name: 'Student Monthly Fitness Pass' },
      { biz: bizGrNoida3, price: 750, name: 'Hydra-Facial & Brightening Glow' },
    ];

    let s1 = null;
    let s6 = null;

    for (let i = 0; i < allBusinesses.length; i++) {
      const { biz, price, name } = allBusinesses[i];
      const s = await Service.create({
        business: biz._id,
        name,
        description: `Verified high-quality service provided by ${biz.name} with certified hygiene and punctuality guarantee.`,
        price,
        duration: 45,
        category: biz.category,
      });
      if (i === 0) s1 = s;
      if (i === 2) s6 = s;
    }

    // Bookings & Reviews for demo
    if (customer1 && customer2 && s1 && s6) {
      const todayStr = new Date().toISOString().split('T')[0];
      await Booking.create({
        customer: customer1._id,
        business: biz1._id,
        service: s1._id,
        date: todayStr,
        startTime: '10:00',
        endTime: '10:45',
        status: 'confirmed',
        checkinOTP: '4872',
        completionOTP: '9315',
        totalPrice: 350,
        notes: 'Please keep sides short',
      });

      const booking2 = await Booking.create({
        customer: customer2._id,
        business: biz3._id,
        service: s6._id,
        date: todayStr,
        startTime: '14:00',
        endTime: '14:45',
        status: 'completed',
        checkinOTP: '3124',
        completionOTP: '7781',
        isVerified: true,
        totalPrice: 1400,
      });

      await Review.create({
        customer: customer2._id,
        business: biz3._id,
        booking: booking2._id,
        rating: 5,
        comment:
          'Incredible Ayurvedic massage! The herbal oils smelled authentic, and the masseuse knew exactly where my muscle stress was. Highly recommended!',
        tags: ['Clean', 'Friendly', 'Highly Recommended', 'Value for Money'],
        isVerified: true,
        ownerReply: {
          text: 'Thank you Priya! Looking forward to welcoming you again!',
          date: new Date(),
        },
      });
    }

    await seedCoupons();

    // Enrich all businesses with Google Maps reviews, googleRating, googleReviewCount, and dual composite score
    const enrichBusinessesWithGoogleData = async () => {
      const allBiz = await Business.find();
      for (const biz of allBiz) {
        if (!biz.googleReviews || biz.googleReviews.length === 0) {
          const pool = seedGoogleReviewsByCategory[biz.category] || seedGoogleReviewsByCategory.salon;
          const now = Date.now();
          biz.googleReviews = pool.map((r, i) => ({
            authorName: r.authorName,
            authorPhoto: '',
            rating: r.rating,
            text: r.text,
            relativeTime: r.relativeTime,
            time: new Date(now - (i + 1) * 7 * 24 * 60 * 60 * 1000),
            isLocalGuide: r.isLocalGuide,
            reviewCount: r.reviewCount,
          }));

          const googleAvg =
            Math.round(
              (biz.googleReviews.reduce((sum, r) => sum + r.rating, 0) / biz.googleReviews.length) * 10
            ) / 10;
          biz.googleRating = googleAvg;
          biz.googleReviewCount = biz.googleReviews.length * 19 + 7;
          biz.platformRating = biz.rating || 4.8;
          biz.rating = Math.round((biz.platformRating * 0.7 + googleAvg * 0.3) * 10) / 10;
          await biz.save();
        }
      }
    };

    await enrichBusinessesWithGoogleData();

    console.log('✅ Demo database seeded with verified stores, 3+ photos, documents & Google reviews.');
  } catch (err) {
    console.error('Error during auto-seeding:', err.message);
  }
};

export default autoSeed;
