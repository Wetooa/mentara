import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { MeetingScalarRelationFilterSchema } from './MeetingScalarRelationFilterSchema';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';

export const MeetingNotesWhereInputSchema: z.ZodType<Prisma.MeetingNotesWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MeetingNotesWhereInputSchema),z.lazy(() => MeetingNotesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingNotesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingNotesWhereInputSchema),z.lazy(() => MeetingNotesWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  meetingId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  meeting: z.union([ z.lazy(() => MeetingScalarRelationFilterSchema),z.lazy(() => MeetingWhereInputSchema) ]).optional(),
}).strict();

export default MeetingNotesWhereInputSchema;
