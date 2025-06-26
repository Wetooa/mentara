import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutClientInputSchema } from './ReviewUpdateWithoutClientInputSchema';
import { ReviewUncheckedUpdateWithoutClientInputSchema } from './ReviewUncheckedUpdateWithoutClientInputSchema';
import { ReviewCreateWithoutClientInputSchema } from './ReviewCreateWithoutClientInputSchema';
import { ReviewUncheckedCreateWithoutClientInputSchema } from './ReviewUncheckedCreateWithoutClientInputSchema';

export const ReviewUpsertWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutClientInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutClientInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ReviewUpsertWithWhereUniqueWithoutClientInputSchema;
