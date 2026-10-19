import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Business from '../models/Business.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import { recordAuditLog } from '../utils/auditLogger.js';

// @desc    Create a new booking (Customer)
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res, next) => {
  try {
    const { businessId, serviceId, date, startTime, notes, couponCode } = req.body;

    if (!businessId || !serviceId || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide businessId, serviceId, date, and startTime',
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive' });
    }

    // Double-booking prevention: check if slot already taken
    const existingConflict = await Booking.findOne({
      business: businessId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    });

    if (existingConflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already reserved. Please select another slot.',
      });
    }

    // Calculate end time based on duration
    const [h, m] = startTime.split(':').map(Number);
    const duration = service.duration || 30;
    const endMinutes = h * 60 + m + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    // Coupon discount calculation
    let originalPrice = service.price;
    let discountAmount = 0;
    let validatedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode });
      const now = new Date();

      if (
        coupon &&
        coupon.isActive &&
        now >= coupon.validFrom &&
        now <= coupon.validUntil &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
        (coupon.scope === 'platform' || coupon.business?.toString() === businessId.toString()) &&
        originalPrice >= (coupon.minBookingAmount || 0)
      ) {
        if (coupon.discountType === 'flat') {
          discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((originalPrice * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        }
        discountAmount = Math.min(discountAmount, originalPrice);
        validatedCoupon = coupon;

        // Increment coupon usage
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      business: businessId,
      service: serviceId,
      date,
      startTime,
      endTime,
      notes: notes || '',
      originalPrice,
      discountAmount,
      couponCode: validatedCoupon ? validatedCoupon.code : '',
      couponApplied: validatedCoupon ? validatedCoupon._id : null,
      totalPrice: finalPrice,
      status: 'confirmed', // Auto-confirm on reservation
    });

    const populated = await Booking.findById(booking._id)
      .populate('business', 'name address phone category')
      .populate('service', 'name price duration');

    // Audit log booking creation
    await recordAuditLog({
      action: 'booking_created',
      category: 'booking',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: booking._id, name: `${service.name} @ ${business.name}`, type: 'Booking' },
      description: `Appointment #${booking._id.toString().slice(-6)} reserved for "${service.name}" at ${business.name} (${date} at ${startTime}) · ₹${service.price}.`,
      details: {
        bookingId: booking._id,
        businessName: business.name,
        serviceName: service.name,
        date,
        startTime,
        totalPrice: service.price,
      },
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/my
// @access  Private (Customer)
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('business', 'name address phone category rating')
      .populate('service', 'name price duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for a business (Owner)
// @route   GET /api/bookings/business/:businessId
// @access  Private (Owner)
export const getBusinessBookings = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find({ business: business._id })
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration')
      .sort({ date: -1, startTime: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Check-in with OTP (Owner enters customer's 4-digit code)
// @route   PUT /api/bookings/:id/verify-checkin
// @access  Private (Owner)
export const verifyCheckin = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id).populate('customer', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const business = await Business.findById(booking.business);
    if (!business || (business.owner.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only the host business owner can verify arrival OTP' });
    }

    // Brute-force protection: Lockout after 5 failed attempts
    if ((booking.failedCheckinAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Security lockout: Maximum OTP verification attempts exceeded (5/5). Please contact support.',
      });
    }

    if (booking.checkinOTP !== String(otp).trim()) {
      booking.failedCheckinAttempts = (booking.failedCheckinAttempts || 0) + 1;
      await booking.save();
      const remaining = 5 - booking.failedCheckinAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid check-in code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Account locked.'}`,
      });
    }

    booking.failedCheckinAttempts = 0;
    booking.status = 'checked-in';
    booking.checkedInAt = new Date();
    await booking.save();

    await recordAuditLog({
      action: 'booking_checkin',
      category: 'booking',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: booking._id, name: `Booking #${booking._id.toString().slice(-6)}`, type: 'Booking' },
      description: `Customer ${booking.customer?.name || 'Customer'} verified arrival OTP for Booking #${booking._id.toString().slice(-6)}.`,
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: `Customer ${booking.customer.name} checked in successfully!`,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Completion with OTP (Customer enters business's 4-digit code)
// @route   PUT /api/bookings/:id/verify-completion
// @access  Private (Customer or Owner)
export const verifyCompletion = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only the appointment customer can confirm service delivery' });
    }

    // Brute-force protection: Lockout after 5 failed attempts
    if ((booking.failedCompletionAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Security lockout: Maximum completion OTP verification attempts exceeded (5/5). Please contact support.',
      });
    }

    if (booking.completionOTP !== String(otp).trim()) {
      booking.failedCompletionAttempts = (booking.failedCompletionAttempts || 0) + 1;
      await booking.save();
      const remaining = 5 - booking.failedCompletionAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid completion code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code locked.'}`,
      });
    }

    booking.failedCompletionAttempts = 0;
    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.isVerified = true;
    await booking.save();

    await recordAuditLog({
      action: 'booking_completed',
      category: 'booking',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: booking._id, name: `Booking #${booking._id.toString().slice(-6)}`, type: 'Booking' },
      description: `Service completed and verified for Booking #${booking._id.toString().slice(-6)}.`,
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Service completed and verified! You can now leave a verified review.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking with refund calculation
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer or Owner)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership authorization check
    const isCustomer = booking.customer.toString() === req.user.id;
    const business = await Business.findById(booking.business);
    const isOwner = business && business.owner.toString() === req.user.id;

    if (!isCustomer && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not have permission to cancel this appointment' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status} and cannot be cancelled`,
      });
    }

    // Calculate hours until appointment
    const appointmentDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
    const now = new Date();
    const diffHours = (appointmentDateTime - now) / (1000 * 60 * 60);

    let refundPercent = 0;
    let refundStatus = 'none';

    if (req.user.role === 'owner') {
      // If business owner cancels, 100% refund
      refundPercent = 1.0;
      refundStatus = 'full';
    } else if (diffHours > 4) {
      refundPercent = 1.0;
      refundStatus = 'full';
    } else if (diffHours >= 1) {
      refundPercent = 0.5;
      refundStatus = 'partial';
    } else {
      refundPercent = 0;
      refundStatus = 'none';
    }

    const refundAmount = Math.round(booking.totalPrice * refundPercent);

    booking.status = 'cancelled';
    booking.refundAmount = refundAmount;
    booking.refundStatus = refundStatus;
    await booking.save();

    // If refund applies, credit to customer's wallet
    if (refundAmount > 0) {
      const customer = await User.findById(booking.customer);
      if (customer) {
        customer.walletBalance += refundAmount;
        customer.walletHistory.push({
          amount: refundAmount,
          type: 'credit',
          reason: `Refund for cancelled booking #${booking._id.toString().slice(-6)} (${refundStatus} refund)`,
          date: new Date(),
        });
        await customer.save();
      }
    }

    await recordAuditLog({
      action: 'booking_cancelled',
      category: 'booking',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: booking._id, name: `Booking #${booking._id.toString().slice(-6)}`, type: 'Booking' },
      description: `Booking #${booking._id.toString().slice(-6)} cancelled by ${req.user.name}. Refund: ₹${refundAmount} (${refundStatus}).`,
      details: { refundAmount, refundStatus },
      status: 'warning',
    });

    res.status(200).json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount} credited to wallet.`,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reschedule a booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private (Customer)
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { date, startTime } = req.body;
    const booking = await Booking.findById(req.params.id).populate('service');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule completed or cancelled booking' });
    }

    // Check slot availability
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      business: booking.business,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
    });

    if (conflict) {
      return res.status(400).json({ success: false, message: 'Selected slot is already reserved.' });
    }

    const [h, m] = startTime.split(':').map(Number);
    const duration = booking.service?.duration || 30;
    const endMinutes = h * 60 + m + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    booking.date = date;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully!',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status by Owner
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
    }
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
