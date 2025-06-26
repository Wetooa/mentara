import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReviewHelpfulUncheckedCreateInputSchema: z.ZodType<Prisma.ReviewHelpfulUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  reviewId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReviewHelpfulUncheckedCreateInputSchema;
