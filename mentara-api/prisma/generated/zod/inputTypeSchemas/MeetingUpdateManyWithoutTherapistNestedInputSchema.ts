import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutTherapistInputSchema } from './MeetingCreateWithoutTherapistInputSchema';
import { MeetingUncheckedCreateWithoutTherapistInputSchema } from './MeetingUncheckedCreateWithoutTherapistInputSchema';
import { MeetingCreateOrConnectWithoutTherapistInputSchema } from './MeetingCreateOrConnectWithoutTherapistInputSchema';
import { MeetingUpsertWithWhereUniqueWithoutTherapistInputSchema } from './MeetingUpsertWithWhereUniqueWithoutTherapistInputSchema';
import { MeetingCreateManyTherapistInputEnvelopeSchema } from './MeetingCreateManyTherapistInputEnvelopeSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithWhereUniqueWithoutTherapistInputSchema } from './MeetingUpdateWithWhereUniqueWithoutTherapistInputSchema';
import { MeetingUpdateManyWithWhereWithoutTherapistInputSchema } from './MeetingUpdateManyWithWhereWithoutTherapistInputSchema';
import { MeetingScalarWhereInputSchema } from './MeetingScalarWhereInputSchema';

export const MeetingUpdateManyWithoutTherapistNestedInputSchema: z.ZodType<Prisma.MeetingUpdateManyWithoutTherapistNestedInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutTherapistInputSchema),z.lazy(() => MeetingCreateWithoutTherapistInputSchema).array(),z.lazy(() => MeetingUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => MeetingCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MeetingUpsertWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => MeetingUpsertWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingCreateManyTherapistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MeetingUpdateWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => MeetingUpdateWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MeetingUpdateManyWithWhereWithoutTherapistInputSchema),z.lazy(() => MeetingUpdateManyWithWhereWithoutTherapistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MeetingScalarWhereInputSchema),z.lazy(() => MeetingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MeetingUpdateManyWithoutTherapistNestedInputSchema;
