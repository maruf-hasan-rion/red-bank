import mongoose from 'mongoose';

const fundSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      enum: ['bdt'],
      default: 'bdt',
      required: true,
    },
    status: {
      type: String,
      enum: ['succeeded', 'refunded', 'pending'],
      default: 'succeeded',
      required: true,
    },
    // Retained for existing records until they are migrated to amountMinor.
    amount: {
      type: Number,
    },
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

fundSchema.index({ createdAt: -1 });

const Fund = mongoose.model('Fund', fundSchema);

export default Fund;
