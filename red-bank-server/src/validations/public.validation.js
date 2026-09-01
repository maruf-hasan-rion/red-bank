import { z } from 'zod';

export const donorSearchSchema = z.object({
  district: z.string().trim().max(100).optional(),
  upazila: z.string().trim().max(100).optional(),
  blood: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
}).strict();

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email format'),
}).strict();
