import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReviewHelpfulUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  reviewId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReviewHelpfulUncheckedCreateWithoutUserInputSchema;
