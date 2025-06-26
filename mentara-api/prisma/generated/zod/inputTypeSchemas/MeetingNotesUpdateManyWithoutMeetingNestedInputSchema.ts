import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesCreateWithoutMeetingInputSchema } from './MeetingNotesCreateWithoutMeetingInputSchema';
import { MeetingNotesUncheckedCreateWithoutMeetingInputSchema } from './MeetingNotesUncheckedCreateWithoutMeetingInputSchema';
import { MeetingNotesCreateOrConnectWithoutMeetingInputSchema } from './MeetingNotesCreateOrConnectWithoutMeetingInputSchema';
import { MeetingNotesUpsertWithWhereUniqueWithoutMeetingInputSchema } from './MeetingNotesUpsertWithWhereUniqueWithoutMeetingInputSchema';
import { MeetingNotesCreateManyMeetingInputEnvelopeSchema } from './MeetingNotesCreateManyMeetingInputEnvelopeSchema';
import { MeetingNotesWhereUniqueInputSchema } from './MeetingNotesWhereUniqueInputSchema';
import { MeetingNotesUpdateWithWhereUniqueWithoutMeetingInputSchema } from './MeetingNotesUpdateWithWhereUniqueWithoutMeetingInputSchema';
import { MeetingNotesUpdateManyWithWhereWithoutMeetingInputSchema } from './MeetingNotesUpdateManyWithWhereWithoutMeetingInputSchema';
import { MeetingNotesScalarWhereInputSchema } from './MeetingNotesScalarWhereInputSchema';

export const MeetingNotesUpdateManyWithoutMeetingNestedInputSchema: z.ZodType<Prisma.MeetingNotesUpdateManyWithoutMeetingNestedInput> = z.object({
  create: z.union([ z.lazy(() => MeetingNotesCreateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesCreateWithoutMeetingInputSchema).array(),z.lazy(() => MeetingNotesUncheckedCreateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUncheckedCreateWithoutMeetingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingNotesCreateOrConnectWithoutMeetingInputSchema),z.lazy(() => MeetingNotesCreateOrConnectWithoutMeetingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MeetingNotesUpsertWithWhereUniqueWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUpsertWithWhereUniqueWithoutMeetingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingNotesCreateManyMeetingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MeetingNotesWhereUniqueInputSchema),z.lazy(() => MeetingNotesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MeetingNotesWhereUniqueInputSchema),z.lazy(() => MeetingNotesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MeetingNotesWhereUniqueInputSchema),z.lazy(() => MeetingNotesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MeetingNotesWhereUniqueInputSchema),z.lazy(() => MeetingNotesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MeetingNotesUpdateWithWhereUniqueWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUpdateWithWhereUniqueWithoutMeetingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MeetingNotesUpdateManyWithWhereWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUpdateManyWithWhereWithoutMeetingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MeetingNotesScalarWhereInputSchema),z.lazy(() => MeetingNotesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MeetingNotesUpdateManyWithoutMeetingNestedInputSchema;
