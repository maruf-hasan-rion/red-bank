import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1).max(3000),
}).strict();
