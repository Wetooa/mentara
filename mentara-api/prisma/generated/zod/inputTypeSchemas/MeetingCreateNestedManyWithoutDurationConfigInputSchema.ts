import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutDurationConfigInputSchema } from './MeetingCreateWithoutDurationConfigInputSchema';
import { MeetingUncheckedCreateWithoutDurationConfigInputSchema } from './MeetingUncheckedCreateWithoutDurationConfigInputSchema';
import { MeetingCreateOrConnectWithoutDurationConfigInputSchema } from './MeetingCreateOrConnectWithoutDurationConfigInputSchema';
import { MeetingCreateManyDurationConfigInputEnvelopeSchema } from './MeetingCreateManyDurationConfigInputEnvelopeSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';

export const MeetingCreateNestedManyWithoutDurationConfigInputSchema: z.ZodType<Prisma.MeetingCreateNestedManyWithoutDurationConfigInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutDurationConfigInputSchema),z.lazy(() => MeetingCreateWithoutDurationConfigInputSchema).array(),z.lazy(() => MeetingUncheckedCreateWithoutDurationConfigInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutDurationConfigInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingCreateOrConnectWithoutDurationConfigInputSchema),z.lazy(() => MeetingCreateOrConnectWithoutDurationConfigInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingCreateManyDurationConfigInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MeetingCreateNestedManyWithoutDurationConfigInputSchema;
