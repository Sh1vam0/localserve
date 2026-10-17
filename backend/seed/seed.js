import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/localserv';
    console.log(`Connecting to MongoDB for seeding: ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB. Clearing existing data...');

    await User.deleteMany();
    await Business.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    console.log('Creating users...');
    // 1. Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@localserv.com',
      password: 'password123',
      phone: '+91 98200 11223',
      role: 'admin',
    });

    // 2. Create Owners
    const owner1 = await User.create({
      name: 'Vikram Malhotra',
      email: 'owner1@localserv.com',
      password: 'password123',
      phone: '+91 98201 22334',
      role: 'owner',
    });

    const owner2 = await User.create({
      name: 'Ananya Sharma',
      email: 'owner2@localserv.com',
      password: 'password123',
      phone: '+91 98202 33445',
      role: 'owner',
    });

    const owner3 = await User.create({
      name: 'Rajesh Kulkarni',
      email: 'owner3@localserv.com',
      password: 'password123',
      phone: '+91 98203 44556',
      role: 'owner',
    });

    // 3. Create Customers
    const customer1 = await User.create({
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

    const customer2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@test.com',
      password: 'password123',
      phone: '+91 98112 66778',
      role: 'customer',
      walletBalance: 0,
    });

    const customer3 = await User.create({
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

    console.log('Creating businesses...');
    // 4. Create 6 Businesses
    const biz1 = await Business.create({
      owner: owner1._id,
      name: 'Glow Luxury Salon & Spa',
      category: 'salon',
      description: 'Premium hair styling, facials, and grooming services by certified master stylists.',
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
        coordinates: [72.8311, 19.1363], // Andheri West
      },
      rating: 4.8,
      reviewCount: 142,
      status: 'approved',
    });

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
        coordinates: [72.8258, 19.0544], // Bandra West
      },
      rating: 4.7,
      reviewCount: 98,
      status: 'approved',
    });

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
        coordinates: [72.8267, 19.0988], // Juhu
      },
      rating: 4.9,
      reviewCount: 210,
      status: 'approved',
    });

    const biz4 = await Business.create({
      owner: owner1._id,
      name: 'Style Studio Hair & Beard',
      category: 'salon',
      description: 'Modern trendy cuts, beard sculpting, keratin treatments and bridal styling.',
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
        coordinates: [72.9051, 19.1197], // Powai
      },
      rating: 4.6,
      reviewCount: 85,
      status: 'approved',
    });

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
        coordinates: [72.8317, 18.9220], // Colaba
      },
      rating: 4.9,
      reviewCount: 64,
      status: 'approved',
    });

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
        coordinates: [72.8397, 19.0178], // Dadar
      },
      rating: 4.5,
      reviewCount: 115,
      status: 'approved',
    });

    console.log('Creating services...');
    // 5. Create Services for each business
    // Glow Salon services
    const s1 = await Service.create({
      business: biz1._id,
      name: 'Classic Signature Haircut & Wash',
      description: 'Includes consultation, hair wash, precision cut, and blow dry styling.',
      price: 350,
      duration: 30,
      category: 'Hair',
    });
    const s2 = await Service.create({
      business: biz1._id,
      name: 'Beard Grooming & Hot Towel Trim',
      description: 'Sharp shape-up, blade line-up, hot towel steam, and organic beard oil treatment.',
      price: 200,
      duration: 20,
      category: 'Beard',
    });
    const s3 = await Service.create({
      business: biz1._id,
      name: 'Gold Radiance Glow Facial',
      description: 'Deep cleansing, gentle exfoliation, gold serum massage, and detox mask.',
      price: 650,
      duration: 45,
      category: 'Face',
    });
    const s4 = await Service.create({
      business: biz1._id,
      name: 'Hair Coloring & Highlights',
      description: 'Ammonia-free vibrant hair color or stylish caramel highlights with protein treatment.',
      price: 1200,
      duration: 60,
      category: 'Hair',
    });

    // FitZone Gym services
    const s5 = await Service.create({
      business: biz2._id,
      name: 'Monthly Unlimited Gym Membership',
      description: 'Full day access to weight training, cardio zone, lockers, and shower facilities.',
      price: 1500,
      duration: 60,
      category: 'Membership',
    });
    const s6 = await Service.create({
      business: biz2._id,
      name: '1-on-1 Personal Training Session',
      description: 'Custom tailored workout plan, form correction, and body composition analysis.',
      price: 600,
      duration: 45,
      category: 'Training',
    });
    const s7 = await Service.create({
      business: biz2._id,
      name: 'HIIT & Functional Fitness Pass',
      description: 'High energy group workout burning up to 700 calories in 45 minutes.',
      price: 400,
      duration: 45,
      category: 'Classes',
    });

    // Serenity Spa services
    const s8 = await Service.create({
      business: biz3._id,
      name: 'Ayurvedic Abhyanga Full Body Massage',
      description: 'Traditional warm herbal oil rhythmic therapy rejuvenating body and mind.',
      price: 1400,
      duration: 60,
      category: 'Massage',
    });
    const s9 = await Service.create({
      business: biz3._id,
      name: 'Deep Tissue & Stress Relief Massage',
      description: 'Focuses on deep muscle knots, chronic shoulder tension, and spinal alignment.',
      price: 1600,
      duration: 60,
      category: 'Massage',
    });
    const s10 = await Service.create({
      business: biz3._id,
      name: 'Aromatherapy Relaxation Ritual',
      description: 'Lavender and eucalyptus essential oils soothing nervous fatigue and promoting deep sleep.',
      price: 1800,
      duration: 75,
      category: 'Therapy',
    });

    // Style Studio services
    const s11 = await Service.create({
      business: biz4._id,
      name: 'Men Premium Cut & Charcoal Scrub',
      description: 'Precision scissor cut, deep blackhead peel-off scrub, and styling pomade.',
      price: 450,
      duration: 40,
      category: 'Hair',
    });
    const s12 = await Service.create({
      business: biz4._id,
      name: 'Keratin Hair Smoothening Treatment',
      description: 'Eliminates frizz, restores shine and protein structure lasting up to 4 months.',
      price: 2500,
      duration: 90,
      category: 'Treatment',
    });

    // Zen Wellness services
    const s13 = await Service.create({
      business: biz5._id,
      name: 'Hatha & Vinyasa Yoga Session',
      description: 'Breath control, posture alignment, and restorative stretching guided by yoga masters.',
      price: 450,
      duration: 60,
      category: 'Yoga',
    });
    const s14 = await Service.create({
      business: biz5._id,
      name: 'Tibetan Singing Bowl Sound Bath',
      description: 'Acoustic frequency therapy melting mental stress and balancing inner chakras.',
      price: 750,
      duration: 45,
      category: 'Meditation',
    });

    // Glamour Parlour services
    const s15 = await Service.create({
      business: biz6._id,
      name: 'Fruit Glow Facial & De-Tan Therapy',
      description: 'Papaya and berry extract natural brightening facial with tan removal pack.',
      price: 550,
      duration: 45,
      category: 'Face',
    });
    const s16 = await Service.create({
      business: biz6._id,
      name: 'Deluxe Manicure & Gel Polish',
      description: 'Exfoliating hand soak, cuticle care, hand massage, and long-lasting gel coating.',
      price: 450,
      duration: 40,
      category: 'Nails',
    });

    console.log('Creating sample bookings...');
    // 6. Create sample bookings
    const todayStr = new Date().toISOString().split('T')[0];

    const booking1 = await Booking.create({
      customer: customer1._id,
      business: biz1._id,
      service: s1._id,
      date: todayStr,
      startTime: '10:00',
      endTime: '10:30',
      status: 'confirmed',
      checkinOTP: '4872',
      completionOTP: '9315',
      totalPrice: 350,
      notes: 'Please keep sides short',
    });

    const booking2 = await Booking.create({
      customer: customer2._id,
      business: biz3._id,
      service: s8._id,
      date: todayStr,
      startTime: '14:00',
      endTime: '15:00',
      status: 'completed',
      checkinOTP: '3124',
      completionOTP: '7781',
      checkedInAt: new Date(Date.now() - 3600 * 2000),
      completedAt: new Date(Date.now() - 1800 * 1000),
      isVerified: true,
      totalPrice: 1400,
    });

    const booking3 = await Booking.create({
      customer: customer3._id,
      business: biz2._id,
      service: s6._id,
      date: todayStr,
      startTime: '16:00',
      endTime: '16:45',
      status: 'checked-in',
      checkinOTP: '6521',
      completionOTP: '4419',
      checkedInAt: new Date(),
      totalPrice: 600,
    });

    console.log('Creating reviews...');
    // 7. Create Reviews
    await Review.create({
      customer: customer2._id,
      business: biz3._id,
      booking: booking2._id,
      rating: 5,
      comment:
        'Absolutely incredible Ayurvedic massage! The herbal oils smelled authentic, and the masseuse knew exactly where my muscle stress was. Highly recommended!',
      tags: ['Clean', 'Friendly', 'Highly Recommended', 'Value for Money'],
      isVerified: true,
      ownerReply: {
        text: 'Thank you Priya! It was our pleasure to serve you. Looking forward to welcoming you again!',
        date: new Date(),
      },
    });

    await Review.create({
      customer: customer1._id,
      business: biz1._id,
      rating: 5,
      comment:
        'Vikram is a master barber. Got the signature haircut and beard trim. Neat, super clean salon, and punctuality is top notch.',
      tags: ['On Time', 'Skilled', 'Clean'],
      isVerified: true,
    });

    await Review.create({
      customer: customer3._id,
      business: biz2._id,
      rating: 4,
      comment:
        'Great equipment and friendly trainers. The functional training area has everything you need. Gets a bit crowded around 6 PM.',
      tags: ['Friendly', 'Value for Money'],
      isVerified: false,
    });

    console.log('🎉 Seed data successfully created!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('👑 Admin:     admin@localserv.com    / password123');
    console.log('🏢 Owner 1:   owner1@localserv.com   / password123 (Glow Salon)');
    console.log('🏢 Owner 2:   owner2@localserv.com   / password123 (FitZone Gym)');
    console.log('🏢 Owner 3:   owner3@localserv.com   / password123 (Serenity Spa)');
    console.log('👤 Customer:  rahul@test.com         / password123');
    console.log('👤 Customer:  priya@test.com         / password123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
