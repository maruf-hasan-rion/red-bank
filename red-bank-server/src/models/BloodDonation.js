import mongoose from 'mongoose';
import { DONATION_STATUS } from '../utils/constants.js';

const bloodDonationSchema = new mongoose.Schema(
  {
    donationDate: {
      type: Date,
      required: true,
    },
    donationMsg: {
      type: String,
      required: true,
    },
    donationTime: {
      type: String,
      required: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientDistrict: {
      type: String,
      required: true,
    },
    recipientUpazila: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: DONATION_STATUS.PENDING,
      enum: Object.values(DONATION_STATUS),
    },
    authorEmail: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
    },
    donorEmail: {
      type: String,
    },
    donorName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

bloodDonationSchema.index({ authorEmail: 1, createdAt: -1 });
bloodDonationSchema.index({ donorEmail: 1, createdAt: -1 });
bloodDonationSchema.index({ status: 1, createdAt: -1 });

const BloodDonation = mongoose.model('BloodDonation', bloodDonationSchema);

export default BloodDonation;
