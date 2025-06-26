import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulUpdateWithoutReviewInputSchema } from './ReviewHelpfulUpdateWithoutReviewInputSchema';
import { ReviewHelpfulUncheckedUpdateWithoutReviewInputSchema } from './ReviewHelpfulUncheckedUpdateWithoutReviewInputSchema';
import { ReviewHelpfulCreateWithoutReviewInputSchema } from './ReviewHelpfulCreateWithoutReviewInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutReviewInputSchema } from './ReviewHelpfulUncheckedCreateWithoutReviewInputSchema';

export const ReviewHelpfulUpsertWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulUpsertWithWhereUniqueWithoutReviewInput> = z.object({
  where: z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewHelpfulUpdateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUncheckedUpdateWithoutReviewInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutReviewInputSchema) ]),
}).strict();

export default ReviewHelpfulUpsertWithWhereUniqueWithoutReviewInputSchema;
