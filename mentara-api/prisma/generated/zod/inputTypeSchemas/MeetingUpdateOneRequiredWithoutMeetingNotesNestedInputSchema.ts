import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateWithoutMeetingNotesInputSchema } from './MeetingCreateWithoutMeetingNotesInputSchema';
import { MeetingUncheckedCreateWithoutMeetingNotesInputSchema } from './MeetingUncheckedCreateWithoutMeetingNotesInputSchema';
import { MeetingCreateOrConnectWithoutMeetingNotesInputSchema } from './MeetingCreateOrConnectWithoutMeetingNotesInputSchema';
import { MeetingUpsertWithoutMeetingNotesInputSchema } from './MeetingUpsertWithoutMeetingNotesInputSchema';
import { MeetingWhereUniqueInputSchema } from './MeetingWhereUniqueInputSchema';
import { MeetingUpdateToOneWithWhereWithoutMeetingNotesInputSchema } from './MeetingUpdateToOneWithWhereWithoutMeetingNotesInputSchema';
import { MeetingUpdateWithoutMeetingNotesInputSchema } from './MeetingUpdateWithoutMeetingNotesInputSchema';
import { MeetingUncheckedUpdateWithoutMeetingNotesInputSchema } from './MeetingUncheckedUpdateWithoutMeetingNotesInputSchema';

export const MeetingUpdateOneRequiredWithoutMeetingNotesNestedInputSchema: z.ZodType<Prisma.MeetingUpdateOneRequiredWithoutMeetingNotesNestedInput> = z.object({
  create: z.union([ z.lazy(() => MeetingCreateWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUncheckedCreateWithoutMeetingNotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MeetingCreateOrConnectWithoutMeetingNotesInputSchema).optional(),
  upsert: z.lazy(() => MeetingUpsertWithoutMeetingNotesInputSchema).optional(),
  connect: z.lazy(() => MeetingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => MeetingUpdateToOneWithWhereWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUpdateWithoutMeetingNotesInputSchema),z.lazy(() => MeetingUncheckedUpdateWithoutMeetingNotesInputSchema) ]).optional(),
}).strict();

export default MeetingUpdateOneRequiredWithoutMeetingNotesNestedInputSchema;
