import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulCreateWithoutReviewInputSchema } from './ReviewHelpfulCreateWithoutReviewInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutReviewInputSchema } from './ReviewHelpfulUncheckedCreateWithoutReviewInputSchema';
import { ReviewHelpfulCreateOrConnectWithoutReviewInputSchema } from './ReviewHelpfulCreateOrConnectWithoutReviewInputSchema';
import { ReviewHelpfulCreateManyReviewInputEnvelopeSchema } from './ReviewHelpfulCreateManyReviewInputEnvelopeSchema';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';

export const ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInput> = z.object({
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulCreateWithoutReviewInputSchema).array(),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewHelpfulCreateOrConnectWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewHelpfulCreateManyReviewInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema;
