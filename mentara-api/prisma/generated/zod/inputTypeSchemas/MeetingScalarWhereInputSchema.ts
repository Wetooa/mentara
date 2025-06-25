import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumMeetingStatusFilterSchema } from './EnumMeetingStatusFilterSchema';
import { MeetingStatusSchema } from './MeetingStatusSchema';

export const MeetingScalarWhereInputSchema: z.ZodType<Prisma.MeetingScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MeetingScalarWhereInputSchema),z.lazy(() => MeetingScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingScalarWhereInputSchema),z.lazy(() => MeetingScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  startTime: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  endTime: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumMeetingStatusFilterSchema),z.lazy(() => MeetingStatusSchema) ]).optional(),
  meetingType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  meetingUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  durationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MeetingScalarWhereInputSchema;
