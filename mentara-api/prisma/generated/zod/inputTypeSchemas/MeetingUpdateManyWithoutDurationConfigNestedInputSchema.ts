import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutDurationConfigInputSchema } from './MeetingCreateWithoutDurationConfigInputSchema';
import { MeetingUncheckedCreateWithoutDurationConfigInputSchema } from './MeetingUncheckedCreateWithoutDurationConfigInputSchema';
import { MeetingCreateOrConnectWithoutDurationConfigInputSchema } from './MeetingCreateOrConnectWithoutDurationConfigInputSchema';
import { MeetingUpsertWithWhereUniqueWithoutDurationConfigInputSchema } from './MeetingUpsertWithWhereUniqueWithoutDurationConfigInputSchema';
import { MeetingCreateManyDurationConfigInputEnvelopeSchema } from './MeetingCreateManyDurationConfigInputEnvelopeSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithWhereUniqueWithoutDurationConfigInputSchema } from './MeetingUpdateWithWhereUniqueWithoutDurationConfigInputSchema';
import { MeetingUpdateManyWithWhereWithoutDurationConfigInputSchema } from './MeetingUpdateManyWithWhereWithoutDurationConfigInputSchema';
import { MeetingScalarWhereInputSchema } from './MeetingScalarWhereInputSchema';

export const MeetingUpdateManyWithoutDurationConfigNestedInputSchema: z.ZodType<Prisma.MeetingUpdateManyWithoutDurationConfigNestedInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutDurationConfigInputSchema),z.lazy(() => MeetingCreateWithoutDurationConfigInputSchema).array(),z.lazy(() => MeetingUncheckedCreateWithoutDurationConfigInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutDurationConfigInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingCreateOrConnectWithoutDurationConfigInputSchema),z.lazy(() => MeetingCreateOrConnectWithoutDurationConfigInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MeetingUpsertWithWhereUniqueWithoutDurationConfigInputSchema),z.lazy(() => MeetingUpsertWithWhereUniqueWithoutDurationConfigInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingCreateManyDurationConfigInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MeetingUpdateWithWhereUniqueWithoutDurationConfigInputSchema),z.lazy(() => MeetingUpdateWithWhereUniqueWithoutDurationConfigInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MeetingUpdateManyWithWhereWithoutDurationConfigInputSchema),z.lazy(() => MeetingUpdateManyWithWhereWithoutDurationConfigInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MeetingScalarWhereInputSchema),z.lazy(() => MeetingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MeetingUpdateManyWithoutDurationConfigNestedInputSchema;
