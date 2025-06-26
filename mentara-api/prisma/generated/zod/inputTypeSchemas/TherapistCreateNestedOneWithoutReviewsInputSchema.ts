import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutReviewsInputSchema } from './TherapistCreateWithoutReviewsInputSchema';
import { TherapistUncheckedCreateWithoutReviewsInputSchema } from './TherapistUncheckedCreateWithoutReviewsInputSchema';
import { TherapistCreateOrConnectWithoutReviewsInputSchema } from './TherapistCreateOrConnectWithoutReviewsInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.TherapistCreateNestedOneWithoutReviewsInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutReviewsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional()
}).strict();

export default TherapistCreateNestedOneWithoutReviewsInputSchema;
