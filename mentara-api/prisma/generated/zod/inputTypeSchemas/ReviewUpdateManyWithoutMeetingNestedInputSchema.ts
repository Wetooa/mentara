import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutMeetingInputSchema } from './ReviewCreateWithoutMeetingInputSchema';
import { ReviewUncheckedCreateWithoutMeetingInputSchema } from './ReviewUncheckedCreateWithoutMeetingInputSchema';
import { ReviewCreateOrConnectWithoutMeetingInputSchema } from './ReviewCreateOrConnectWithoutMeetingInputSchema';
import { ReviewUpsertWithWhereUniqueWithoutMeetingInputSchema } from './ReviewUpsertWithWhereUniqueWithoutMeetingInputSchema';
import { ReviewCreateManyMeetingInputEnvelopeSchema } from './ReviewCreateManyMeetingInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithWhereUniqueWithoutMeetingInputSchema } from './ReviewUpdateWithWhereUniqueWithoutMeetingInputSchema';
import { ReviewUpdateManyWithWhereWithoutMeetingInputSchema } from './ReviewUpdateManyWithWhereWithoutMeetingInputSchema';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';

export const ReviewUpdateManyWithoutMeetingNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutMeetingNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutMeetingInputSchema),z.lazy(() => ReviewCreateWithoutMeetingInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutMeetingInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutMeetingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutMeetingInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutMeetingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutMeetingInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutMeetingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyMeetingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutMeetingInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutMeetingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutMeetingInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutMeetingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReviewUpdateManyWithoutMeetingNestedInputSchema;
