import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulCreateWithoutUserInputSchema } from './ReviewHelpfulCreateWithoutUserInputSchema';
import { ReviewHelpfulUncheckedCreateWithoutUserInputSchema } from './ReviewHelpfulUncheckedCreateWithoutUserInputSchema';

export const ReviewHelpfulCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewHelpfulCreateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ReviewHelpfulCreateOrConnectWithoutUserInputSchema;
