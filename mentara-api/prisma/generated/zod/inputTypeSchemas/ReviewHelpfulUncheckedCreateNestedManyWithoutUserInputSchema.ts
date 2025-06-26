import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulCreateWithoutUserInputSchema } from './ReviewHelpfulCreateWithoutUserInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutUserInputSchema } from './ReviewHelpfulUncheckedCreateWithoutUserInputSchema';
import { ReviewHelpfulCreateOrConnectWithoutUserInputSchema } from './ReviewHelpfulCreateOrConnectWithoutUserInputSchema';
import { ReviewHelpfulCreateManyUserInputEnvelopeSchema } from './ReviewHelpfulCreateManyUserInputEnvelopeSchema';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';

export const ReviewHelpfulUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulCreateWithoutUserInputSchema).array(),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewHelpfulCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReviewHelpfulCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewHelpfulCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),z.lazy(() => ReviewHelpfulWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReviewHelpfulUncheckedCreateNestedManyWithoutUserInputSchema;
