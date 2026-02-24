import { z } from 'zod';

export const CreatePackageSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  sessionCount: z.number().int().min(1),
  price: z.number().min(0),
  validityDays: z.number().int().min(1),
  features: z.array(z.string()).optional(),
});

export type CreatePackageDto = z.infer<typeof CreatePackageSchema>;
