import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutHelpfulVotesInputSchema } from './ReviewCreateWithoutHelpfulVotesInputSchema';
import { ReviewUncheckedCreateWithoutHelpfulVotesInputSchema } from './ReviewUncheckedCreateWithoutHelpfulVotesInputSchema';
import { ReviewCreateOrConnectWithoutHelpfulVotesInputSchema } from './ReviewCreateOrConnectWithoutHelpfulVotesInputSchema';
import { ReviewUpsertWithoutHelpfulVotesInputSchema } from './ReviewUpsertWithoutHelpfulVotesInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateToOneWithWhereWithoutHelpfulVotesInputSchema } from './ReviewUpdateToOneWithWhereWithoutHelpfulVotesInputSchema';
import { ReviewUpdateWithoutHelpfulVotesInputSchema } from './ReviewUpdateWithoutHelpfulVotesInputSchema';
import { ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema } from './ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema';

export const ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema: z.ZodType<Prisma.ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutHelpfulVotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutHelpfulVotesInputSchema).optional(),
  upsert: z.lazy(() => ReviewUpsertWithoutHelpfulVotesInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateToOneWithWhereWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUpdateWithoutHelpfulVotesInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutHelpfulVotesInputSchema) ]).optional(),
}).strict();

export default ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema;
