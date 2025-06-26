import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';
import { ReviewUpdateManyMutationInputSchema } from './ReviewUpdateManyMutationInputSchema';
import { ReviewUncheckedUpdateManyWithoutTherapistInputSchema } from './ReviewUncheckedUpdateManyWithoutTherapistInputSchema';

export const ReviewUpdateManyWithWhereWithoutTherapistInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutTherapistInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutTherapistInputSchema) ]),
}).strict();

export default ReviewUpdateManyWithWhereWithoutTherapistInputSchema;
