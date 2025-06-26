import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesCreateWithoutMeetingInputSchema } from './MeetingNotesCreateWithoutMeetingInputSchema';
import { MeetingNotesUncheckedCreateWithoutMeetingInputSchema } from './MeetingNotesUncheckedCreateWithoutMeetingInputSchema';
import { MeetingNotesCreateOrConnectWithoutMeetingInputSchema } from './MeetingNotesCreateOrConnectWithoutMeetingInputSchema';
import { MeetingNotesCreateManyMeetingInputEnvelopeSchema } from './MeetingNotesCreateManyMeetingInputEnvelopeSchema';
import { MeetingNotesWhereUniqueInputSchema } from './MeetingNotesWhereUniqueInputSchema';

export const MeetingNotesUncheckedCreateNestedManyWithoutMeetingInputSchema: z.ZodType<Prisma.MeetingNotesUncheckedCreateNestedManyWithoutMeetingInput> = z.object({
  create: z.union([ z.lazy(() => MeetingNotesCreateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesCreateWithoutMeetingInputSchema).array(),z.lazy(() => MeetingNotesUncheckedCreateWithoutMeetingInputSchema),z.lazy(() => MeetingNotesUncheckedCreateWithoutMeetingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MeetingNotesCreateOrConnectWithoutMeetingInputSchema),z.lazy(() => MeetingNotesCreateOrConnectWithoutMeetingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MeetingNotesCreateManyMeetingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MeetingNotesWhereUniqueInputSchema),z.lazy(() => MeetingNotesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MeetingNotesUncheckedCreateNestedManyWithoutMeetingInputSchema;
