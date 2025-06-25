import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { EnumMeetingStatusWithAggregatesFilterSchema } from './EnumMeetingStatusWithAggregatesFilterSchema';
import { MeetingStatusSchema } from './MeetingStatusSchema';

export const MeetingScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MeetingScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => MeetingScalarWhereWithAggregatesInputSchema),z.lazy(() => MeetingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingScalarWhereWithAggregatesInputSchema),z.lazy(() => MeetingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  startTime: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  endTime: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  duration: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumMeetingStatusWithAggregatesFilterSchema),z.lazy(() => MeetingStatusSchema) ]).optional(),
  meetingType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  meetingUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  notes: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  clientId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  durationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MeetingScalarWhereWithAggregatesInputSchema;
