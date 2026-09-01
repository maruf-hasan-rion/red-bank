import { z } from 'zod';
import { BLOOD_GROUPS, DONATION_STATUS } from '../utils/constants.js';

export const createDonationSchema = z.object({
  donationDate: z.coerce.date(),
  donationMsg: z.string().trim().min(1).max(2000),
  donationTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  fullAddress: z.string().trim().min(1).max(300),
  hospitalName: z.string().trim().min(1).max(200),
  recipientEmail: z.string().email('Invalid email format'),
  recipientName: z.string().trim().min(1).max(100),
  recipientDistrict: z.string().trim().min(1).max(100),
  recipientUpazila: z.string().trim().min(1).max(100),
  bloodGroup: z.enum(BLOOD_GROUPS),
}).strict();

export const claimDonationSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Valid donation ID is required'),
}).strict();

export const updateDonationSchema = z.object({
  donationDate: z.coerce.date().optional(),
  donationMsg: z.string().trim().min(1).max(2000).optional(),
  donationTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  fullAddress: z.string().trim().min(1).max(300).optional(),
  hospitalName: z.string().trim().min(1).max(200).optional(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().trim().min(1).max(100).optional(),
  recipientDistrict: z.string().trim().min(1).max(100).optional(),
  recipientUpazila: z.string().trim().min(1).max(100).optional(),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  status: z.enum(Object.values(DONATION_STATUS)).optional(),
}).strict();
