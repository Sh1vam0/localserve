import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    scope: {
      type: String,
      enum: ['platform', 'store'],
      default: 'platform', // 'platform' = whole website, 'store' = single business
      index: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null, // Null for platform-wide coupons
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage', // percentage (e.g. 20%) or flat (e.g. ₹100)
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount amount or percentage'],
      min: 1,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Cap for percentage discounts (e.g. max ₹200 off)
    },
    validFrom: {
      type: Date,
      required: [true, 'Please specify active start time frame'],
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, 'Please specify active end time frame'],
      index: true,
    },
    usageLimit: {
      type: Number,
      default: 100, // Total redemptions allowed across platform
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Method to compute dynamic live status
CouponSchema.methods.computeStatus = function () {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (now < this.validFrom) return 'scheduled';
  if (now > this.validUntil) return 'expired';
  if (this.usageLimit && this.usedCount >= this.usageLimit) return 'exhausted';
  return 'active';
};

export default mongoose.model('Coupon', CouponSchema);
