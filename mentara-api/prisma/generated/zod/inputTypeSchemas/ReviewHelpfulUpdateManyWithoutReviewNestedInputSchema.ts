import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulCreateWithoutReviewInputSchema } from './ReviewHelpfulCreateWithoutReviewInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutReviewInputSchema } from './ReviewHelpfulUncheckedCreateWithoutReviewInputSchema';
import { ReviewHelpfulCreateOrConnectWithoutReviewInputSchema } from './ReviewHelpfulCreateOrConnectWithoutReviewInputSchema';
import { ReviewHelpfulUpsertWithWhereUniqueWithoutReviewInputSchema } from './ReviewHelpfulUpsertWithWhereUniqueWithoutReviewInputSchema';
import { ReviewHelpfulCreateManyReviewInputEnvelopeSchema } from './ReviewHelpfulCreateManyReviewInputEnvelopeSchema';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulUpdateWithWhereUniqueWithoutReviewInputSchema } from './ReviewHelpfulUpdateWithWhereUniqueWithoutReviewInputSchema';
import { ReviewHelpfulUpdateManyWithWhereWithoutReviewInputSchema } from './ReviewHelpfulUpdateManyWithWhereWithoutReviewInputSchema';
import { ReviewHelpfulScalarWhereInputSchema } from './ReviewHelpfulScalarWhereInputSchema';

export const ReviewHelpfulUpdateManyWithoutReviewNestedInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateManyWithoutReviewNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulCreateWithoutReviewInputSchema).array(),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewHelpfulCreateOrConnectWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewHelpfulUpsertWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUpsertWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewHelpfulCreateManyReviewInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewHelpfulUpdateWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUpdateWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewHelpfulUpdateManyWithWhereWithoutReviewInputSchema),z.lazy(() => ReviewHelpfulUpdateManyWithWhereWithoutReviewInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewHelpfulScalarWhereInputSchema),z.lazy(() => ReviewHelpfulScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReviewHelpfulUpdateManyWithoutReviewNestedInputSchema;
