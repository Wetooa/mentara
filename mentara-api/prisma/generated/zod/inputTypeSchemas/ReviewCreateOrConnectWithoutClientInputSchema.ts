import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutClientInputSchema } from './ReviewCreateWithoutClientInputSchema';
import { ReviewUncheckedCreateWithoutClientInputSchema } from './ReviewUncheckedCreateWithoutClientInputSchema';

export const ReviewCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutClientInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ReviewCreateOrConnectWithoutClientInputSchema;
