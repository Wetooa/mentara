import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutClientInputSchema } from './ReviewCreateWithoutClientInputSchema';
import { ReviewUncheckedCreateWithoutClientInputSchema } from './ReviewUncheckedCreateWithoutClientInputSchema';
import { ReviewCreateOrConnectWithoutClientInputSchema } from './ReviewCreateOrConnectWithoutClientInputSchema';
import { ReviewUpsertWithWhereUniqueWithoutClientInputSchema } from './ReviewUpsertWithWhereUniqueWithoutClientInputSchema';
import { ReviewCreateManyClientInputEnvelopeSchema } from './ReviewCreateManyClientInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithWhereUniqueWithoutClientInputSchema } from './ReviewUpdateWithWhereUniqueWithoutClientInputSchema';
import { ReviewUpdateManyWithWhereWithoutClientInputSchema } from './ReviewUpdateManyWithWhereWithoutClientInputSchema';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';

export const ReviewUpdateManyWithoutClientNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutClientInputSchema),z.lazy(() => ReviewCreateWithoutClientInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutClientInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutClientInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyClientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutClientInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutClientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReviewUpdateManyWithoutClientNestedInputSchema;
