import Review from '../models/Review.js';
import Business from '../models/Business.js';
import Booking from '../models/Booking.js';

// @desc    Get reviews for a business
// @route   GET /api/reviews/business/:businessId
// @access  Public
export const getBusinessReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ business: req.params.businessId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a review (Customer)
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res, next) => {
  try {
    const { businessId, rating, comment, tags, bookingId } = req.body;

    if (!businessId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide businessId, rating, and comment',
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Check if customer had a completed booking at this business
    let isVerified = false;
    let validBookingId = bookingId;

    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        customer: req.user.id,
        business: businessId,
        status: 'completed',
      });
      if (booking) {
        isVerified = booking.isVerified;
      }
    } else {
      const pastBooking = await Booking.findOne({
        customer: req.user.id,
        business: businessId,
        status: 'completed',
      });
      if (pastBooking) {
        isVerified = pastBooking.isVerified;
        validBookingId = pastBooking._id;
      }
    }

    // Validate rating range strictly between 1 and 5
    const numericRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
    if (isNaN(numericRating)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating number between 1 and 5' });
    }

    // Prevent duplicate review spamming: each customer can submit one review per business
    const existingReview = await Review.findOne({
      customer: req.user.id,
      business: businessId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this business. You can update your existing review instead.',
      });
    }

    const review = await Review.create({
      customer: req.user.id,
      business: businessId,
      booking: validBookingId,
      rating: numericRating,
      comment: String(comment).trim(),
      tags: Array.isArray(tags) ? tags : [],
      isVerified,
    });

    // Recalculate business platform average, Google average, and weighted composite rating
    const allReviews = await Review.find({ business: businessId });
    const platformAvg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    business.platformRating = Math.round(platformAvg * 10) / 10;
    business.reviewCount = allReviews.length;

    // Dual review weighted calculation: 70% NearNest Platform + 30% Google Maps
    if (business.googleReviews && business.googleReviews.length > 0 && business.googleRating) {
      business.rating = Math.round((platformAvg * 0.7 + business.googleRating * 0.3) * 10) / 10;
    } else {
      business.rating = business.platformRating;
    }
    await business.save();

    const populated = await Review.findById(review._id).populate('customer', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reply to review (Business Owner)
// @route   PUT /api/reviews/:id/reply
// @access  Private (Owner)
export const addOwnerReply = async (req, res, next) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.ownerReply = {
      text,
      date: new Date(),
    };
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Owner response posted',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin or Review Author)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const businessId = review.business;
    await review.deleteOne();

    // Recalculate rating
    const allReviews = await Review.find({ business: businessId });
    const business = await Business.findById(businessId);
    if (business) {
      if (allReviews.length === 0) {
        business.platformRating = 4.5;
        business.reviewCount = 0;
        business.rating = business.googleRating || 4.5;
      } else {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        business.platformRating = Math.round(avg * 10) / 10;
        business.reviewCount = allReviews.length;

        if (business.googleReviews && business.googleReviews.length > 0 && business.googleRating) {
          business.rating = Math.round((business.platformRating * 0.7 + business.googleRating * 0.3) * 10) / 10;
        } else {
          business.rating = business.platformRating;
        }
      }
      await business.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (err) {
    next(err);
  }
};
