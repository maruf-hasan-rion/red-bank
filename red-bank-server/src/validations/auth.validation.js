import { z } from 'zod';
import { BLOOD_GROUPS, ROLES, STATUS } from '../utils/constants.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  uid: z.string().min(1, 'UID is required').optional(),
  name: z.string().trim().min(2).max(100),
  avatar: z.string().url('Invalid avatar URL'),
  bloodGroup: z.enum(BLOOD_GROUPS),
  district: z.string().trim().min(1).max(100),
  upazila: z.string().trim().min(1).max(100),
}).strict();

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  avatar: z.string().url().optional(),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  district: z.string().trim().min(1).max(100).optional(),
  upazila: z.string().trim().min(1).max(100).optional(),
}).strict();

export const updateRoleSchema = z.object({
  role: z.enum(Object.values(ROLES)),
}).strict();

export const updateStatusSchema = z.object({
  status: z.enum(Object.values(STATUS)),
}).strict();
