import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const MeetingNotesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MeetingNotesScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => MeetingNotesScalarWhereWithAggregatesInputSchema),z.lazy(() => MeetingNotesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingNotesScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingNotesScalarWhereWithAggregatesInputSchema),z.lazy(() => MeetingNotesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  meetingId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MeetingNotesScalarWhereWithAggregatesInputSchema;
