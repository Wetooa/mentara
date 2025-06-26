import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutClientInputSchema } from './MeetingCreateWithoutClientInputSchema';
import { MeetingUncheckedCreateWithoutClientInputSchema } from './MeetingUncheckedCreateWithoutClientInputSchema';
import { MeetingCreateOrConnectWithoutClientInputSchema } from './MeetingCreateOrConnectWithoutClientInputSchema';
import { MeetingCreateManyClientInputEnvelopeSchema } from './MeetingCreateManyClientInputEnvelopeSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';

export const MeetingCreateNestedManyWithoutClientInputSchema: z.ZodType<Prisma.MeetingCreateNestedManyWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutClientInputSchema),z.lazy(() => MeetingCreateWithoutClientInputSchema).array(),z.lazy(() => MeetingUncheckedCreateWithoutClientInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingCreateOrConnectWithoutClientInputSchema),z.lazy(() => MeetingCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingCreateManyClientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MeetingCreateNestedManyWithoutClientInputSchema;
