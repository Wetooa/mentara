import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { ReviewUpdateWithoutHelpfulVotesInputSchema } from './ReviewUpdateWithoutHelpfulVotesInputSchema';
import { ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema } from './ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema';

export const ReviewUpdateToOneWithWhereWithoutHelpfulVotesInputSchema: z.ZodType<Prisma.ReviewUpdateToOneWithWhereWithoutHelpfulVotesInput> = z.object({
  where: z.lazy(() => ReviewWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema) ]),
}).strict();

export default ReviewUpdateToOneWithWhereWithoutHelpfulVotesInputSchema;
