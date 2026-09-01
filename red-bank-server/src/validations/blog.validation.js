import { z } from 'zod';

export const createBlogSchema = z.object({
  postTitle: z.string().trim().min(1).max(120),
  permalink: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  thumbnail: z.string().url('Invalid thumbnail URL').refine((value) => /^https?:\/\//i.test(value)),
  status: z.enum(['draft', 'published']).optional(),
  shortDescription: z.string().trim().max(400).optional(),
  content: z.string().max(100000).optional(),
  timeToRead: z.coerce.number().finite().min(0).max(999).optional(),
}).strict();

export const updateBlogSchema = z.object({
  postTitle: z.string().trim().min(1).max(120).optional(),
  permalink: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  thumbnail: z.string().url().refine((value) => /^https?:\/\//i.test(value)).optional(),
  status: z.enum(['draft', 'published']).optional(),
  shortDescription: z.string().trim().max(400).optional(),
  content: z.string().max(100000).optional(),
  timeToRead: z.coerce.number().finite().min(0).max(999).optional(),
}).strict();
