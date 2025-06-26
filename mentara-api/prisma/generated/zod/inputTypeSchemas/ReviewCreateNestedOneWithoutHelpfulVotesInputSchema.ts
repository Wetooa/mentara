import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutHelpfulVotesInputSchema } from './ReviewCreateWithoutHelpfulVotesInputSchema';
import { ReviewUncheckedCreateWithoutHelpfulVotesInputSchema } from './ReviewUncheckedCreateWithoutHelpfulVotesInputSchema';
import { ReviewCreateOrConnectWithoutHelpfulVotesInputSchema } from './ReviewCreateOrConnectWithoutHelpfulVotesInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewCreateNestedOneWithoutHelpfulVotesInputSchema: z.ZodType<Prisma.ReviewCreateNestedOneWithoutHelpfulVotesInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHelpfulVotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutHelpfulVotesInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional()
}).strict();

export default ReviewCreateNestedOneWithoutHelpfulVotesInputSchema;
