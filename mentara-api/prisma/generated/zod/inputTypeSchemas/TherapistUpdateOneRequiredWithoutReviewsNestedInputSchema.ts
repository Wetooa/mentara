import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutReviewsInputSchema } from './TherapistCreateWithoutReviewsInputSchema';
import { TherapistUncheckedCreateWithoutReviewsInputSchema } from './TherapistUncheckedCreateWithoutReviewsInputSchema';
import { TherapistCreateOrConnectWithoutReviewsInputSchema } from './TherapistCreateOrConnectWithoutReviewsInputSchema';
import { TherapistUpsertWithoutReviewsInputSchema } from './TherapistUpsertWithoutReviewsInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateToOneWithWhereWithoutReviewsInputSchema } from './TherapistUpdateToOneWithWhereWithoutReviewsInputSchema';
import { TherapistUpdateWithoutReviewsInputSchema } from './TherapistUpdateWithoutReviewsInputSchema';
import { TherapistUncheckedUpdateWithoutReviewsInputSchema } from './TherapistUncheckedUpdateWithoutReviewsInputSchema';

export const TherapistUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.TherapistUpdateOneRequiredWithoutReviewsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutReviewsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => TherapistUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateToOneWithWhereWithoutReviewsInputSchema),z.lazy(() => TherapistUpdateWithoutReviewsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateOneRequiredWithoutReviewsNestedInputSchema;
