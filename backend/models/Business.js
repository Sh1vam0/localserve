import mongoose from 'mongoose';

const WorkingHourSchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0=Sunday, 1=Monday...
    open: { type: String, default: '09:00' },
    close: { type: String, default: '20:00' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const BusinessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide business name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['salon', 'gym', 'spa', 'parlour', 'wellness', 'other'],
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Noida', required: true },
      state: { type: String, default: 'Uttar Pradesh' },
      pincode: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.3260, 28.5708], // Centroid coords
      },
    },
    offersRideAssistance: {
      type: Boolean,
      default: true,
    },
    rideNotes: {
      type: String,
      default: 'Designated drop-off point and valet parking available at main entrance.',
    },
    uberDropoffName: {
      type: String,
      default: '',
    },
    workingHours: {
      type: [WorkingHourSchema],
      default: [
        { day: 0, open: '10:00', close: '18:00', isClosed: true }, // Sunday closed by default or open
        { day: 1, open: '09:00', close: '20:00', isClosed: false },
        { day: 2, open: '09:00', close: '20:00', isClosed: false },
        { day: 3, open: '09:00', close: '20:00', isClosed: false },
        { day: 4, open: '09:00', close: '20:00', isClosed: false },
        { day: 5, open: '09:00', close: '20:00', isClosed: false },
        { day: 6, open: '09:00', close: '21:00', isClosed: false },
      ],
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    platformRating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    googlePlaceId: {
      type: String,
      default: '',
    },
    googleRating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    googleReviewCount: {
      type: Number,
      default: 0,
    },
    googleReviews: [
      {
        authorName: { type: String, required: true },
        authorPhoto: { type: String, default: '' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, required: true },
        relativeTime: { type: String, default: 'Recently' },
        time: { type: Date, default: Date.now },
        isLocalGuide: { type: Boolean, default: false },
        reviewCount: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'approved',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending_review', 'verified', 'rejected'],
      default: 'verified', // Defaults to verified for demo seeds
    },
    verificationDocuments: {
      gstin: { type: String, default: '' },
      tradeLicense: { type: String, default: '' },
      ownerIdType: { type: String, default: 'Aadhaar / Passport' },
      ownerIdNumber: { type: String, default: '' },
      documentUrl: { type: String, default: '' },
      submittedAt: { type: Date, default: Date.now },
      verifiedAt: { type: Date },
      rejectionReason: { type: String, default: '' },
    },
    pinpointLocation: {
      landmark: { type: String, default: '' },
      googleMapsUrl: { type: String, default: '' },
      isPinpointConfirmed: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

BusinessSchema.index({ location: '2dsphere' });
BusinessSchema.index({ name: 'text', description: 'text', 'address.city': 'text' });

export default mongoose.model('Business', BusinessSchema);
