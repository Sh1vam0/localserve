import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide service name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please provide service price'],
      min: 0,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please provide service duration in minutes'],
      default: 30,
      min: 10,
    },
    category: {
      type: String,
      default: 'General',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Service', ServiceSchema);
