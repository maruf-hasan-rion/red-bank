import mongoose from 'mongoose';
import { ROLES, STATUS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    uid: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    upazila: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: STATUS.ACTIVE,
      enum: Object.values(STATUS),
    },
    role: {
      type: String,
      default: ROLES.DONOR,
      enum: Object.values(ROLES),
    },
    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, status: 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);

export default User;
