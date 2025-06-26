import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutHelpfulVotesInputSchema } from './ReviewCreateWithoutHelpfulVotesInputSchema';
import { ReviewUncheckedCreateWithoutHelpfulVotesInputSchema } from './ReviewUncheckedCreateWithoutHelpfulVotesInputSchema';

export const ReviewCreateOrConnectWithoutHelpfulVotesInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutHelpfulVotesInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHelpfulVotesInputSchema) ]),
}).strict();

export default ReviewCreateOrConnectWithoutHelpfulVotesInputSchema;
