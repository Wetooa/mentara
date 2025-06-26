import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutTherapistInputSchema } from './ReviewCreateWithoutTherapistInputSchema';
import { ReviewUncheckedCreateWithoutTherapistInputSchema } from './ReviewUncheckedCreateWithoutTherapistInputSchema';

export const ReviewCreateOrConnectWithoutTherapistInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutTherapistInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutTherapistInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default ReviewCreateOrConnectWithoutTherapistInputSchema;
