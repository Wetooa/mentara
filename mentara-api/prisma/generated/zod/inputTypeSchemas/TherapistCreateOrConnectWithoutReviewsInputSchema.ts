import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutReviewsInputSchema } from './TherapistCreateWithoutReviewsInputSchema';
import { TherapistUncheckedCreateWithoutReviewsInputSchema } from './TherapistUncheckedCreateWithoutReviewsInputSchema';

export const TherapistCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutReviewsInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutReviewsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutReviewsInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutReviewsInputSchema;
