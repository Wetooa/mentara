import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const MeetingNotesScalarWhereInputSchema: z.ZodType<Prisma.MeetingNotesScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MeetingNotesScalarWhereInputSchema),z.lazy(() => MeetingNotesScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingNotesScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingNotesScalarWhereInputSchema),z.lazy(() => MeetingNotesScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  meetingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MeetingNotesScalarWhereInputSchema;
