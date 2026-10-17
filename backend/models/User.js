import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      default: 'customer',
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    adminPermissions: {
      canVerifyBusinesses: { type: Boolean, default: true },
      canManageUsers: { type: Boolean, default: true },
      canManageBookings: { type: Boolean, default: true },
      canManageAdmins: { type: Boolean, default: false },
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    walletHistory: [
      {
        amount: Number,
        type: { type: String, enum: ['credit', 'debit'] },
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      isSuperAdmin: this.isSuperAdmin,
    },
    process.env.JWT_SECRET || 'localserv_hackathon_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export default mongoose.model('User', UserSchema);
