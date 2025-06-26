import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistUpdateWithoutReviewsInputSchema } from './TherapistUpdateWithoutReviewsInputSchema';
import { TherapistUncheckedUpdateWithoutReviewsInputSchema } from './TherapistUncheckedUpdateWithoutReviewsInputSchema';

export const TherapistUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.TherapistUpdateToOneWithWhereWithoutReviewsInput> = z.object({
  where: z.lazy(() => TherapistWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TherapistUpdateWithoutReviewsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutReviewsInputSchema) ]),
}).strict();

export default TherapistUpdateToOneWithWhereWithoutReviewsInputSchema;
