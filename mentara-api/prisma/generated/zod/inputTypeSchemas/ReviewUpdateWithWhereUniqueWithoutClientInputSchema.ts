import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutClientInputSchema } from './ReviewUpdateWithoutClientInputSchema';
import { ReviewUncheckedUpdateWithoutClientInputSchema } from './ReviewUncheckedUpdateWithoutClientInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutClientInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default ReviewUpdateWithWhereUniqueWithoutClientInputSchema;
