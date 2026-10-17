import Business from '../models/Business.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import { calculateDistance } from '../services/recommendationEngine.js';

// @desc    Get all businesses with filters
// @route   GET /api/businesses
// @access  Public
export const getBusinesses = async (req, res, next) => {
  try {
    const { search, category, city, rating, sort, lat, lng } = req.query;

    let query = { status: 'approved' };

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (search) {
      // Clean "near me" from the search query so e.g. "spa near me" searches for "spa"
      const cleanSearch = search.replace(/\bnear\s+me\b/gi, '').trim();
      const term = cleanSearch || search;

      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { 'address.street': { $regex: term, $options: 'i' } },
        { 'address.city': { $regex: term, $options: 'i' } },
        { 'address.state': { $regex: term, $options: 'i' } },
      ];
    }

    let businesses = await Business.find(query).populate('owner', 'name email phone').lean();

    // Attach services count and starting price to each business
    const businessIds = businesses.map((b) => b._id);
    const services = await Service.find({ business: { $in: businessIds }, isActive: true }).lean();

    const priceMap = {};
    services.forEach((s) => {
      const bId = s.business.toString();
      if (!priceMap[bId]) priceMap[bId] = [];
      priceMap[bId].push(s.price);
    });

    const userLat = lat ? parseFloat(lat) : 19.076;
    const userLng = lng ? parseFloat(lng) : 72.8777;

    businesses = businesses.map((b) => {
      const prices = priceMap[b._id.toString()] || [];
      const startingPrice = prices.length ? Math.min(...prices) : 250;
      const bLng = b.location?.coordinates?.[0] || 72.8777;
      const bLat = b.location?.coordinates?.[1] || 19.076;
      const distance = Math.round(calculateDistance(userLat, userLng, bLat, bLng) * 10) / 10;

      return {
        ...b,
        startingPrice,
        servicesCount: prices.length,
        distanceKm: distance,
      };
    });

    // Sorting
    if (sort === 'rating') {
      businesses.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'price_asc') {
      businesses.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sort === 'price_desc') {
      businesses.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sort === 'nearest' || lat) {
      businesses.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      businesses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single business
// @route   GET /api/businesses/:id
// @access  Public
export const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).populate('owner', 'name email phone');
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const services = await Service.find({ business: business._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        ...business.toObject(),
        services,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new business
// @route   POST /api/businesses
// @access  Private (Owner only)
export const createBusiness = async (req, res, next) => {
  try {
    const existing = await Business.findOne({ owner: req.user.id });
    if (existing && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Owner already has a business registered. Update existing business instead.',
      });
    }

    if (req.body.images && req.body.images.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Verification policy requires at least 3 photos (Storefront Exterior, Interior Ambience, and Workstation/Facility).',
      });
    }

    const street = req.body.address?.street || '';
    const city = req.body.address?.city || '';
    const name = req.body.name || '';
    const lat = req.body.location?.coordinates?.[1] ?? 28.5708;
    const lng = req.body.location?.coordinates?.[0] ?? 77.3260;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, street, city].filter(Boolean).join(' '))}`;

    const businessData = {
      ...req.body,
      owner: req.user.id,
      status: 'approved',
      verificationStatus: req.body.verificationStatus || 'verified',
      pinpointLocation: {
        landmark: req.body.pinpointLocation?.landmark || '',
        googleMapsUrl,
        isPinpointConfirmed: true,
      },
    };

    const business = await Business.create(businessData);

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update business
// @route   PUT /api/businesses/:id
// @access  Private (Owner or Admin)
export const updateBusiness = async (req, res, next) => {
  try {
    let business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this business' });
    }

    if (req.body.images && req.body.images.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Verification policy requires at least 3 photos (Storefront Exterior, Interior Ambience, and Workstation/Facility).',
      });
    }

    const street = req.body.address?.street || business.address?.street || '';
    const city = req.body.address?.city || business.address?.city || '';
    const name = req.body.name || business.name || '';
    const lat = req.body.location?.coordinates?.[1] ?? business.location?.coordinates?.[1] ?? 28.5708;
    const lng = req.body.location?.coordinates?.[0] ?? business.location?.coordinates?.[0] ?? 77.3260;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, street, city].filter(Boolean).join(' '))}`;

    const updatePayload = {
      ...req.body,
      'pinpointLocation.googleMapsUrl': googleMapsUrl,
      'pinpointLocation.isPinpointConfirmed': true,
    };

    business = await Business.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit verification documents
// @route   PUT /api/businesses/:id/verification
// @access  Private (Owner)
export const submitVerification = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { gstin, tradeLicense, ownerIdType, ownerIdNumber, documentUrl } = req.body;

    business.verificationStatus = 'pending_review';
    business.verificationDocuments = {
      gstin: gstin || business.verificationDocuments?.gstin || '',
      tradeLicense: tradeLicense || business.verificationDocuments?.tradeLicense || '',
      ownerIdType: ownerIdType || business.verificationDocuments?.ownerIdType || 'Aadhaar / Passport',
      ownerIdNumber: ownerIdNumber || business.verificationDocuments?.ownerIdNumber || '',
      documentUrl: documentUrl || business.verificationDocuments?.documentUrl || '',
      submittedAt: new Date(),
      rejectionReason: '',
    };

    await business.save();

    res.status(200).json({
      success: true,
      message: 'Verification documents submitted for review',
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get owner's business
// @route   GET /api/businesses/owner/me
// @access  Private (Owner)
export const getMyBusiness = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(200).json({ success: true, data: null });
    }
    const services = await Service.find({ business: business._id });
    res.status(200).json({
      success: true,
      data: {
        ...business.toObject(),
        services,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check available time slots for a business and date
// @route   GET /api/businesses/:id/availability
// @access  Public
export const getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date query parameter' });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Determine day of the week (0=Sun, 1=Mon, ..., 6=Sat)
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const dayConfig = business.workingHours.find((w) => w.day === dayOfWeek) || {
      open: '09:00',
      close: '20:00',
      isClosed: false,
    };

    if (dayConfig.isClosed) {
      return res.status(200).json({
        success: true,
        isClosed: true,
        message: 'Business is closed on this day',
        slots: [],
      });
    }

    // Generate 30-min intervals from open to close
    const [openH, openM] = dayConfig.open.split(':').map(Number);
    const [closeH, closeM] = dayConfig.close.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Find existing confirmed or checked-in bookings for this business on this date
    const bookedSlots = await Booking.find({
      business: business._id,
      date,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    }).select('startTime endTime');

    const bookedSet = new Set(bookedSlots.map((b) => b.startTime));

    const slots = [];
    for (let time = openMinutes; time + 30 <= closeMinutes; time += 30) {
      const h = Math.floor(time / 60);
      const m = time % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const endH = Math.floor((time + 30) / 60);
      const endM = (time + 30) % 60;
      const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      slots.push({
        time: timeStr,
        endTime: endTimeStr,
        isAvailable: !bookedSet.has(timeStr),
      });
    }

    res.status(200).json({
      success: true,
      isClosed: false,
      date,
      slots,
    });
  } catch (err) {
    next(err);
  }
};
