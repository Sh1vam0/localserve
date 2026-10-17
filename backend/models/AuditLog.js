import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['auth', 'booking', 'verification', 'governance', 'system'],
      default: 'system',
      index: true,
    },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'System' },
      email: { type: String, default: '' },
      role: { type: String, default: 'visitor' },
    },
    target: {
      id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, default: '' },
      type: { type: String, default: '' },
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'warning'],
      default: 'success',
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);
