import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReviewHelpfulCreateManyReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulCreateManyReviewInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReviewHelpfulCreateManyReviewInputSchema;
