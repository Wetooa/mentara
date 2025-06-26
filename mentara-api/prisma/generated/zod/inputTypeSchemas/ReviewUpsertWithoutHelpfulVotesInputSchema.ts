import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewUpdateWithoutHelpfulVotesInputSchema } from './ReviewUpdateWithoutHelpfulVotesInputSchema';
import { ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema } from './ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema';
import { ReviewCreateWithoutHelpfulVotesInputSchema } from './ReviewCreateWithoutHelpfulVotesInputSchema';
import { ReviewUncheckedCreateWithoutHelpfulVotesInputSchema } from './ReviewUncheckedCreateWithoutHelpfulVotesInputSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewUpsertWithoutHelpfulVotesInputSchema: z.ZodType<Prisma.ReviewUpsertWithoutHelpfulVotesInput> = z.object({
  update: z.union([ z.lazy(() => ReviewUpdateWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHelpfulVotesInputSchema) ]),
  where: z.lazy(() => ReviewWhereInputSchema).optional()
}).strict();

export default ReviewUpsertWithoutHelpfulVotesInputSchema;
