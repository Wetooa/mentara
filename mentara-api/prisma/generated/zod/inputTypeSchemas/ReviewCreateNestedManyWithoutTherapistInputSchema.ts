import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutTherapistInputSchema } from './ReviewCreateWithoutTherapistInputSchema';
import { ReviewUncheckedCreateWithoutTherapistInputSchema } from './ReviewUncheckedCreateWithoutTherapistInputSchema';
import { ReviewCreateOrConnectWithoutTherapistInputSchema } from './ReviewCreateOrConnectWithoutTherapistInputSchema';
import { ReviewCreateManyTherapistInputEnvelopeSchema } from './ReviewCreateManyTherapistInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewCreateNestedManyWithoutTherapistInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutTherapistInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutTherapistInputSchema),z.lazy(() => ReviewCreateWithoutTherapistInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyTherapistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReviewCreateNestedManyWithoutTherapistInputSchema;
