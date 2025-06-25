import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutTherapistInputSchema } from './MeetingCreateWithoutTherapistInputSchema';
import { MeetingUncheckedCreateWithoutTherapistInputSchema } from './MeetingUncheckedCreateWithoutTherapistInputSchema';
import { MeetingCreateOrConnectWithoutTherapistInputSchema } from './MeetingCreateOrConnectWithoutTherapistInputSchema';
import { MeetingCreateManyTherapistInputEnvelopeSchema } from './MeetingCreateManyTherapistInputEnvelopeSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';

export const MeetingCreateNestedManyWithoutTherapistInputSchema: z.ZodType<Prisma.MeetingCreateNestedManyWithoutTherapistInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutTherapistInputSchema),z.lazy(() => MeetingCreateWithoutTherapistInputSchema).array(),z.lazy(() => MeetingUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => MeetingCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingCreateManyTherapistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MeetingCreateNestedManyWithoutTherapistInputSchema;
