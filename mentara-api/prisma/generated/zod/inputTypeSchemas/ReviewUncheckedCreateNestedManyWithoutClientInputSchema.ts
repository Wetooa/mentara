import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutClientInputSchema } from './ReviewCreateWithoutClientInputSchema';
import { ReviewUncheckedCreateWithoutClientInputSchema } from './ReviewUncheckedCreateWithoutClientInputSchema';
import { ReviewCreateOrConnectWithoutClientInputSchema } from './ReviewCreateOrConnectWithoutClientInputSchema';
import { ReviewCreateManyClientInputEnvelopeSchema } from './ReviewCreateManyClientInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewUncheckedCreateNestedManyWithoutClientInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutClientInputSchema),z.lazy(() => ReviewCreateWithoutClientInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutClientInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutClientInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyClientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReviewUncheckedCreateNestedManyWithoutClientInputSchema;
