import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutTherapistInputSchema } from './ReviewCreateWithoutTherapistInputSchema';
import { ReviewUncheckedCreateWithoutTherapistInputSchema } from './ReviewUncheckedCreateWithoutTherapistInputSchema';
import { ReviewCreateOrConnectWithoutTherapistInputSchema } from './ReviewCreateOrConnectWithoutTherapistInputSchema';
import { ReviewUpsertWithWhereUniqueWithoutTherapistInputSchema } from './ReviewUpsertWithWhereUniqueWithoutTherapistInputSchema';
import { ReviewCreateManyTherapistInputEnvelopeSchema } from './ReviewCreateManyTherapistInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithWhereUniqueWithoutTherapistInputSchema } from './ReviewUpdateWithWhereUniqueWithoutTherapistInputSchema';
import { ReviewUpdateManyWithWhereWithoutTherapistInputSchema } from './ReviewUpdateManyWithWhereWithoutTherapistInputSchema';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';

export const ReviewUpdateManyWithoutTherapistNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutTherapistNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutTherapistInputSchema),z.lazy(() => ReviewCreateWithoutTherapistInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyTherapistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutTherapistInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutTherapistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReviewUpdateManyWithoutTherapistNestedInputSchema;
