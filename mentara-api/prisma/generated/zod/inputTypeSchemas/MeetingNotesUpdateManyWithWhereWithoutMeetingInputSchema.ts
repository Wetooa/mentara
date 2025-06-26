import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesScalarWhereInputSchema } from './MeetingNotesScalarWhereInputSchema';
import { MeetingNotesUpdateManyMutationInputSchema } from './MeetingNotesUpdateManyMutationInputSchema';
import { MeetingNotesUncheckedUpdateManyWithoutMeetingInputSchema } from './MeetingNotesUncheckedUpdateManyWithoutMeetingInputSchema';

export const MeetingNotesUpdateManyWithWhereWithoutMeetingInputSchema: z.ZodType<Prisma.MeetingNotesUpdateManyWithWhereWithoutMeetingInput> = z.object({
  where: z.lazy(() => MeetingNotesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MeetingNotesUpdateManyMutationInputSchema),z.lazy(() => MeetingNotesUncheckedUpdateManyWithoutMeetingInputSchema) ]),
}).strict();

export default MeetingNotesUpdateManyWithWhereWithoutMeetingInputSchema;
