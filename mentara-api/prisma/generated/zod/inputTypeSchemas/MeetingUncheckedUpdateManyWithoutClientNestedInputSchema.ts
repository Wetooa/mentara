import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutClientInputSchema } from './MeetingCreateWithoutClientInputSchema';
import { MeetingUncheckedCreateWithoutClientInputSchema } from './MeetingUncheckedCreateWithoutClientInputSchema';
import { MeetingCreateOrConnectWithoutClientInputSchema } from './MeetingCreateOrConnectWithoutClientInputSchema';
import { MeetingUpsertWithWhereUniqueWithoutClientInputSchema } from './MeetingUpsertWithWhereUniqueWithoutClientInputSchema';
import { MeetingCreateManyClientInputEnvelopeSchema } from './MeetingCreateManyClientInputEnvelopeSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateWithWhereUniqueWithoutClientInputSchema } from './MeetingUpdateWithWhereUniqueWithoutClientInputSchema';
import { MeetingUpdateManyWithWhereWithoutClientInputSchema } from './MeetingUpdateManyWithWhereWithoutClientInputSchema';
import { MeetingScalarWhereInputSchema } from './MeetingScalarWhereInputSchema';

export const MeetingUncheckedUpdateManyWithoutClientNestedInputSchema: z.ZodType<Prisma.MeetingUncheckedUpdateManyWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutClientInputSchema),z.lazy(() => MeetingCreateWithoutClientInputSchema).array(),z.lazy(() => MeetingUncheckedCreateWithoutClientInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingCreateOrConnectWithoutClientInputSchema),z.lazy(() => MeetingCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MeetingUpsertWithWhereUniqueWithoutClientInputSchema),z.lazy(() => MeetingUpsertWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingCreateManyClientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MeetingWhereUniqueInputSchema),z.lazy(() => MeetingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MeetingUpdateWithWhereUniqueWithoutClientInputSchema),z.lazy(() => MeetingUpdateWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MeetingUpdateManyWithWhereWithoutClientInputSchema),z.lazy(() => MeetingUpdateManyWithWhereWithoutClientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MeetingScalarWhereInputSchema),z.lazy(() => MeetingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MeetingUncheckedUpdateManyWithoutClientNestedInputSchema;
