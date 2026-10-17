import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      trim: true,
    },
    tags: [
      {
        type: String,
        enum: ['Friendly', 'On Time', 'Clean', 'Value for Money', 'Skilled', 'Average', 'Highly Recommended'],
      },
    ],
    isVerified: {
      type: Boolean,
      default: false, // True if linked to a verified completed booking
    },
    ownerReply: {
      text: { type: String, default: '' },
      date: { type: Date },
    },
  },
  { timestamps: true }
);

// Prevent same customer reviewing same business multiple times (or allow updates)
ReviewSchema.index({ customer: 1, business: 1 });

export default mongoose.model('Review', ReviewSchema);
