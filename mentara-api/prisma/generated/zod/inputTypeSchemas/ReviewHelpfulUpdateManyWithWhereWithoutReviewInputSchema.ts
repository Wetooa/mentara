import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulScalarWhereInputSchema } from './ReviewHelpfulScalarWhereInputSchema';
import { ReviewHelpfulUpdateManyMutationInputSchema } from './ReviewHelpfulUpdateManyMutationInputSchema';
import { ReviewHelpfulUncheckedUpdateManyWithoutReviewInputSchema } from './ReviewHelpfulUncheckedUpdateManyWithoutReviewInputSchema';

export const ReviewHelpfulUpdateManyWithWhereWithoutReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateManyWithWhereWithoutReviewInput> = z.object({
  where: z.lazy(() => ReviewHelpfulScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewHelpfulUpdateManyMutationInputSchema),z.lazy(() => ReviewHelpfulUncheckedUpdateManyWithoutReviewInputSchema) ]),
}).strict();

export default ReviewHelpfulUpdateManyWithWhereWithoutReviewInputSchema;
