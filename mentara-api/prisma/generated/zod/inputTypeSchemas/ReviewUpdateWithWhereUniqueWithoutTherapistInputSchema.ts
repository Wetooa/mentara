import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutTherapistInputSchema } from './ReviewUpdateWithoutTherapistInputSchema';
import { ReviewUncheckedUpdateWithoutTherapistInputSchema } from './ReviewUncheckedUpdateWithoutTherapistInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutTherapistInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutTherapistInputSchema) ]),
}).strict();

export default ReviewUpdateWithWhereUniqueWithoutTherapistInputSchema;
