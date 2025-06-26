import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulScalarWhereInputSchema } from './ReviewHelpfulScalarWhereInputSchema';
import { ReviewHelpfulUpdateManyMutationInputSchema } from './ReviewHelpfulUpdateManyMutationInputSchema';
import { ReviewHelpfulUncheckedUpdateManyWithoutUserInputSchema } from './ReviewHelpfulUncheckedUpdateManyWithoutUserInputSchema';

export const ReviewHelpfulUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewHelpfulScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewHelpfulUpdateManyMutationInputSchema),z.lazy(() => ReviewHelpfulUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default ReviewHelpfulUpdateManyWithWhereWithoutUserInputSchema;
