import { z } from 'zod';

export const paymentIntentSchema = z.object({
  amount: z.coerce.number().finite().min(50).max(1000000),
  note: z.string().trim().max(500).optional(),
}).strict();
