import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format for easy slot comparisons
      required: [true, 'Please select a booking date'],
    },
    startTime: {
      type: String, // e.g. "09:00", "14:30"
      required: [true, 'Please select a start time'],
    },
    endTime: {
      type: String, // e.g. "09:30", "15:00"
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled', 'no-show'],
      default: 'confirmed',
    },
    checkinOTP: {
      type: String, // 4 digit string shown to customer
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    completionOTP: {
      type: String, // 4 digit string generated when business starts or prepares completion
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    checkedInAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'partial', 'full'],
      default: 'none',
    },
  },
  { timestamps: true }
);

// Index to quickly check for double booking
BookingSchema.index({ business: 1, date: 1, startTime: 1, status: 1 });

export default mongoose.model('Booking', BookingSchema);
