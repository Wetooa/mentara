import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutTherapistInputSchema } from './ReviewUpdateWithoutTherapistInputSchema';
import { ReviewUncheckedUpdateWithoutTherapistInputSchema } from './ReviewUncheckedUpdateWithoutTherapistInputSchema';
import { ReviewCreateWithoutTherapistInputSchema } from './ReviewCreateWithoutTherapistInputSchema';
import { ReviewUncheckedCreateWithoutTherapistInputSchema } from './ReviewUncheckedCreateWithoutTherapistInputSchema';

export const ReviewUpsertWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutTherapistInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutTherapistInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutTherapistInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default ReviewUpsertWithWhereUniqueWithoutTherapistInputSchema;
