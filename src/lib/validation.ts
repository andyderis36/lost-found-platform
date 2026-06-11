import { z } from 'zod';

export const customFieldsSchema = z.record(z.string().max(64), z.union([
  z.string().max(256),
  z.number(),
  z.boolean(),
]));

export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(32),
  description: z.string().max(500).optional(),
  image: z.string().max(1_000_000).optional(), // base64 string, max ~1MB
  customFields: customFieldsSchema.optional(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(32).optional(),
  description: z.string().max(500).optional(),
  image: z.string().max(1_000_000).optional(),
  customFields: customFieldsSchema.optional(),
  status: z.enum(['active', 'lost', 'found', 'inactive']).optional(),
});
