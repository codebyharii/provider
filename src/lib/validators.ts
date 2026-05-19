import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number format"),
  city: z.string().min(2, "City is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  serviceId: z.number().int().positive(),
});

export const webhookSchema = z.object({
  event_id: z.string().min(1),
  type: z.literal("quota_reset"),
});
