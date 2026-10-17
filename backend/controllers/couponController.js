import Coupon from '../models/Coupon.js';
import Business from '../models/Business.js';
import { recordAuditLog } from '../utils/auditLogger.js';

// @desc    Create a new coupon (Admin for platform-wide, Owner for store-specific)
// @route   POST /api/coupons
// @access  Private (Admin or Owner)
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      title,
      description,
      scope = 'platform',
      businessId,
      discountType = 'percentage',
      discountValue,
      minBookingAmount = 0,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit = 100,
    } = req.body;

    if (!code || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code, discount value, and active validity time frame (validUntil)',
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" is already in use` });
    }

    // Determine scope and validate business ownership
    let finalScope = scope;
    let targetBusinessId = null;

    if (req.user.role === 'owner') {
      // Store owners can only create coupons for their own business
      const ownerBiz = await Business.findOne({ owner: req.user.id });
      if (!ownerBiz) {
        return res.status(400).json({ success: false, message: 'You must have a registered business to offer coupons' });
      }
      finalScope = 'store';
      targetBusinessId = ownerBiz._id;
    } else if (req.user.role === 'admin') {
      if (scope === 'store' && businessId) {
        targetBusinessId = businessId;
      }
    }

    const startDate = validFrom ? new Date(validFrom) : new Date();
    const endDate = new Date(validUntil);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time frame: Expiration date (validUntil) must be after the start date (validFrom)',
      });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      title: title || cleanCode,
      description: description || '',
      scope: finalScope,
      business: targetBusinessId,
      createdBy: req.user.id,
      discountType,
      discountValue: Number(discountValue),
      minBookingAmount: Number(minBookingAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      validFrom: startDate,
      validUntil: endDate,
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      isActive: true,
    });

    await recordAuditLog({
      action: 'coupon_created',
      category: 'governance',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: coupon._id, name: coupon.code, type: 'Coupon' },
      description: `${finalScope === 'platform' ? 'Platform-wide' : 'Store'} promotional coupon "${coupon.code}" created with active time frame until ${endDate.toLocaleDateString()}.`,
      details: { scope: finalScope, discountType, discountValue, validUntil: endDate },
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully!`,
      data: coupon,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get coupons (Public active list, or filtered for Admin/Owner)
// @route   GET /api/coupons
// @access  Public / Private
export const getCoupons = async (req, res, next) => {
  try {
    const { scope, businessId, activeOnly } = req.query;
    let query = {};

    if (scope && scope !== 'all') {
      query.scope = scope;
    }

    if (businessId) {
      // If businessId given, match store coupons for that business OR platform coupons
      query.$or = [{ business: businessId }, { scope: 'platform' }];
    }

    if (activeOnly === 'true') {
      const now = new Date();
      query.isActive = true;
      query.validFrom = { $lte: now };
      query.validUntil = { $gte: now };
    }

    const rawCoupons = await Coupon.find(query)
      .populate('business', 'name category address')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    const coupons = rawCoupons.map((c) => ({
      ...c.toObject(),
      status: c.computeStatus(),
    }));

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Validate and calculate coupon discount at checkout
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, businessId, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code and appointment order amount',
      });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code. Please check spelling.' });
    }

    const now = new Date();
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active.' });
    }

    if (now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: `This promotion starts on ${new Date(coupon.validFrom).toLocaleDateString()}. Not yet active.`,
      });
    }

    if (now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: `This coupon expired on ${new Date(coupon.validUntil).toLocaleDateString()}.`,
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its maximum redemption limit.' });
    }

    // Check store scope
    if (coupon.scope === 'store') {
      if (!businessId || coupon.business.toString() !== businessId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is exclusive to another specific store.',
        });
      }
    }

    // Check minimum spend
    const amount = Number(orderAmount);
    if (coupon.minBookingAmount && amount < coupon.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum appointment booking of ₹${coupon.minBookingAmount} required to use this coupon.`,
      });
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === 'flat') {
      discount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      discount = Math.round((amount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    }

    discount = Math.min(discount, amount);
    const finalPrice = Math.max(0, amount - discount);

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You save ₹${discount}.`,
      data: {
        couponId: coupon._id,
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        originalPrice: amount,
        finalPrice,
        validUntil: coupon.validUntil,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle coupon active status or edit time frame
// @route   PUT /api/coupons/:id
// @access  Private (Admin or Owner)
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Check authority: Admin or creator
    if (req.user.role !== 'admin' && coupon.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this coupon' });
    }

    const { isActive, validUntil, validFrom, usageLimit } = req.body;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin or Owner)
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (req.user.role !== 'admin' && coupon.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this coupon' });
    }

    await coupon.deleteOne();

    await recordAuditLog({
      action: 'coupon_deleted',
      category: 'governance',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      description: `Coupon "${coupon.code}" deleted by ${req.user.name}.`,
      status: 'warning',
    });

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};
