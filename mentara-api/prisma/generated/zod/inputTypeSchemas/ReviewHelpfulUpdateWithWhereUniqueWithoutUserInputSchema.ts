import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulWhereUniqueInputSchema } from './ReviewHelpfulWhereUniqueInputSchema';
import { ReviewHelpfulUpdateWithoutUserInputSchema } from './ReviewHelpfulUpdateWithoutUserInputSchema';
import { ReviewHelpfulUncheckedUpdateWithoutUserInputSchema } from './ReviewHelpfulUncheckedUpdateWithoutUserInputSchema';

export const ReviewHelpfulUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewHelpfulWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewHelpfulUpdateWithoutUserInputSchema),z.lazy(() => ReviewHelpfulUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ReviewHelpfulUpdateWithWhereUniqueWithoutUserInputSchema;
