import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';
import { ReviewUpdateManyMutationInputSchema } from './ReviewUpdateManyMutationInputSchema';
import { ReviewUncheckedUpdateManyWithoutClientInputSchema } from './ReviewUncheckedUpdateManyWithoutClientInputSchema';

export const ReviewUpdateManyWithWhereWithoutClientInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutClientInputSchema) ]),
}).strict();

export default ReviewUpdateManyWithWhereWithoutClientInputSchema;
