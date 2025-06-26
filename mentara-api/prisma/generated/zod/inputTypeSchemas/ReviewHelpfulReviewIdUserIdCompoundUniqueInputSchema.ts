import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReviewHelpfulReviewIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.ReviewHelpfulReviewIdUserIdCompoundUniqueInput> = z.object({
  reviewId: z.string(),
  userId: z.string()
}).strict();

export default ReviewHelpfulReviewIdUserIdCompoundUniqueInputSchema;
