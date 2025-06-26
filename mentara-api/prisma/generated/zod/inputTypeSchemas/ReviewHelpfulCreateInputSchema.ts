import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateNestedOneWithoutHelpfulVotesInputSchema } from './ReviewCreateNestedOneWithoutHelpfulVotesInputSchema';
import { UserCreateNestedOneWithoutReviewsHelpfulInputSchema } from './UserCreateNestedOneWithoutReviewsHelpfulInputSchema';

export const ReviewHelpfulCreateInputSchema: z.ZodType<Prisma.ReviewHelpfulCreateInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  review: z.lazy(() => ReviewCreateNestedOneWithoutHelpfulVotesInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsHelpfulInputSchema)
}).strict();

export default ReviewHelpfulCreateInputSchema;
