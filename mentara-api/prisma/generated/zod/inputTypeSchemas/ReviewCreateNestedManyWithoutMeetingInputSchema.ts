import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewCreateWithoutMeetingInputSchema } from './ReviewCreateWithoutMeetingInputSchema';
import { ReviewUncheckedCreateWithoutMeetingInputSchema } from './ReviewUncheckedCreateWithoutMeetingInputSchema';
import { ReviewCreateOrConnectWithoutMeetingInputSchema } from './ReviewCreateOrConnectWithoutMeetingInputSchema';
import { ReviewCreateManyMeetingInputEnvelopeSchema } from './ReviewCreateManyMeetingInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewCreateNestedManyWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutMeetingInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutMeetingInputSchema),z.lazy(() => ReviewCreateWithoutMeetingInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutMeetingInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutMeetingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutMeetingInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutMeetingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyMeetingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReviewCreateNestedManyWithoutMeetingInputSchema;
