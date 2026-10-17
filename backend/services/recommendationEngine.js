import Business from '../models/Business.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// Calculate Haversine distance in km between two lat/lng coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getHybridRecommendations = async ({
  userId = null,
  lat = null,
  lng = null,
  category = null,
  maxDistance = null,
  limit = 8,
}) => {
  try {
    // 1. Fetch approved businesses
    let query = { status: 'approved' };
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    const businesses = await Business.find(query).lean();
    if (!businesses.length) {
      return {
        recommended: [],
        nearYou: [],
        trending: [],
        topRated: [],
        newAndNoteworthy: [],
      };
    }

    const businessIds = businesses.map((b) => b._id);
    const services = await Service.find({ business: { $in: businessIds }, isActive: true }).lean();

    // Map starting and avg price per business
    const bizPriceMap = {};
    services.forEach((s) => {
      const bId = s.business.toString();
      if (!bizPriceMap[bId]) bizPriceMap[bId] = [];
      bizPriceMap[bId].push(s.price);
    });

    const bizAvgPrice = {};
    const bizStartingPrice = {};
    businesses.forEach((b) => {
      const prices = bizPriceMap[b._id.toString()] || [300];
      const sum = prices.reduce((a, c) => a + c, 0);
      bizAvgPrice[b._id.toString()] = sum / prices.length;
      bizStartingPrice[b._id.toString()] = Math.min(...prices);
    });

    // 2. Fetch booking counts for popularity
    const recentBookings = await Booking.aggregate([
      { $match: { business: { $in: businessIds } } },
      { $group: { _id: '$business', count: { $sum: 1 } } },
    ]);

    const bookingCountMap = {};
    let maxBookings = 1;
    recentBookings.forEach((rb) => {
      bookingCountMap[rb._id.toString()] = rb.count;
      if (rb.count > maxBookings) maxBookings = rb.count;
    });

    // 3. User personalization history
    let userCategoryCounts = {};
    let userAvgSpend = 500;
    let userTotalBookings = 0;

    if (userId) {
      const userBookings = await Booking.find({ customer: userId })
        .populate('business', 'category')
        .populate('service', 'price')
        .lean();

      if (userBookings.length > 0) {
        userTotalBookings = userBookings.length;
        let spendSum = 0;
        userBookings.forEach((ub) => {
          if (ub.business?.category) {
            userCategoryCounts[ub.business.category] = (userCategoryCounts[ub.business.category] || 0) + 1;
          }
          if (ub.totalPrice) spendSum += ub.totalPrice;
        });
        userAvgSpend = spendSum / userBookings.length;
      }
    }

    // 4. Global rating average (C) for Bayesian calculation
    const globalAvgRating =
      businesses.reduce((acc, b) => acc + (b.rating || 4.0), 0) / (businesses.length || 1);
    const m = 3; // Minimum reviews weight

    // 5. User GPS coordinates (defaults to user's location if provided, else Mumbai center)
    const hasLiveLocation = lat && lng;
    const userLat = lat ? parseFloat(lat) : 19.076;
    const userLng = lng ? parseFloat(lng) : 72.8777;

    const scoredBusinesses = businesses.map((biz) => {
      const bId = biz._id.toString();

      // S1: Location Proximity Score
      const bLng = biz.location?.coordinates?.[0] || 72.8777;
      const bLat = biz.location?.coordinates?.[1] || 19.076;
      const distance = calculateDistance(userLat, userLng, bLat, bLng);
      // Smooth decay function: places within 5km receive high scores
      const locationScore = 1 / (1 + distance / 6);

      // S2: Bayesian Weighted Rating Score
      const v = biz.reviewCount || 0;
      const R = biz.rating || 4.0;
      const bayesianRating = (v * R + m * globalAvgRating) / (v + m);
      const ratingScore = bayesianRating / 5;

      // S3: Popularity Momentum Score
      const bCount = bookingCountMap[bId] || 0;
      const popularityScore = bCount / maxBookings;

      // S4: Price Affordability Score
      const avgP = bizAvgPrice[bId] || 400;
      const priceDiff = Math.abs(userAvgSpend - avgP);
      const priceScore = Math.max(0, 1 - priceDiff / 1500);

      // S5: Category Affinity Score
      const catCount = userCategoryCounts[biz.category] || 0;
      const personalScore = userTotalBookings > 0 ? catCount / userTotalBookings : 0.5;

      // S6: Verification Trust Bonus (+10 points for vetted partner stores)
      const isVerified = biz.verificationStatus === 'verified';
      const verifiedBonus = isVerified ? 0.10 : 0;

      // S7: Recency Boost (created within 30 days)
      const daysSinceCreated = (Date.now() - new Date(biz.createdAt).getTime()) / (1000 * 3600 * 24);
      const recencyScore = Math.max(0, 1 - (daysSinceCreated || 0) / 30);

      // Composite Hybrid Score (0 - 100)
      const locationWeight = hasLiveLocation ? 0.35 : 0.20;
      const compositeScore =
        (locationWeight * locationScore +
          0.20 * ratingScore +
          0.15 * popularityScore +
          0.10 * priceScore +
          0.10 * personalScore +
          0.10 * recencyScore +
          verifiedBonus) *
        100;

      // Travel time estimation
      let travelEstimate = '';
      if (distance < 1.5) {
        travelEstimate = `${Math.max(2, Math.round(distance * 12))} min walk`;
      } else {
        travelEstimate = `${Math.max(4, Math.round(distance * 2.5) + 3)} min drive`;
      }

      return {
        ...biz,
        distanceKm: Math.round(distance * 10) / 10,
        travelEstimate,
        startingPrice: bizStartingPrice[bId] || 299,
        avgPrice: Math.round(avgP),
        bayesianRating: Math.round(bayesianRating * 10) / 10,
        score: Math.round(compositeScore),
      };
    });

    // Distance filtering if maxDistance specified
    let filteredScored = scoredBusinesses;
    if (maxDistance && !isNaN(maxDistance)) {
      filteredScored = scoredBusinesses.filter((b) => b.distanceKm <= parseFloat(maxDistance));
      if (!filteredScored.length) filteredScored = scoredBusinesses; // Fallback if none in radius
    }

    // Sort into presentation categories
    const recommended = [...filteredScored].sort((a, b) => b.score - a.score).slice(0, limit);
    const nearYou = [...filteredScored].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
    const trending = [...filteredScored]
      .sort((a, b) => (bookingCountMap[b._id.toString()] || 0) - (bookingCountMap[a._id.toString()] || 0))
      .slice(0, limit);
    const topRated = [...filteredScored]
      .sort((a, b) => b.bayesianRating - a.bayesianRating)
      .slice(0, limit);
    const newAndNoteworthy = [...filteredScored]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    return {
      recommended,
      nearYou,
      trending,
      topRated,
      newAndNoteworthy,
      userLocation: hasLiveLocation ? { lat: userLat, lng: userLng } : null,
    };
  } catch (error) {
    console.error('Recommendation engine error:', error);
    return {
      recommended: [],
      nearYou: [],
      trending: [],
      topRated: [],
      newAndNoteworthy: [],
      userLocation: null,
    };
  }
};
