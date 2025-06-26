import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutReviewsHelpfulInputSchema } from './UserCreateNestedOneWithoutReviewsHelpfulInputSchema';

export const ReviewHelpfulCreateWithoutReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulCreateWithoutReviewInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsHelpfulInputSchema)
}).strict();

export default ReviewHelpfulCreateWithoutReviewInputSchema;
