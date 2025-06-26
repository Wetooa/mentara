import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateNestedOneWithoutHelpfulVotesInputSchema } from './ReviewCreateNestedOneWithoutHelpfulVotesInputSchema';

export const ReviewHelpfulCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  review: z.lazy(() => ReviewCreateNestedOneWithoutHelpfulVotesInputSchema)
}).strict();

export default ReviewHelpfulCreateWithoutUserInputSchema;
