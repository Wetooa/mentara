import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReviewHelpfulCreateManyUserInputSchema: z.ZodType<Prisma.ReviewHelpfulCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  reviewId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReviewHelpfulCreateManyUserInputSchema;
