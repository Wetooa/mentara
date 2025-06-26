import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistUpdateWithoutReviewsInputSchema } from './TherapistUpdateWithoutReviewsInputSchema';
import { TherapistUncheckedUpdateWithoutReviewsInputSchema } from './TherapistUncheckedUpdateWithoutReviewsInputSchema';
import { TherapistCreateWithoutReviewsInputSchema } from './TherapistCreateWithoutReviewsInputSchema';
import { TherapistUncheckedCreateWithoutReviewsInputSchema } from './TherapistUncheckedCreateWithoutReviewsInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.TherapistUpsertWithoutReviewsInput> = z.object({
  update: z.union([ z.lazy(() => TherapistUpdateWithoutReviewsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => TherapistCreateWithoutReviewsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistUpsertWithoutReviewsInputSchema;
