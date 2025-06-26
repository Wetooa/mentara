import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumMeetingStatusFilterSchema } from './EnumMeetingStatusFilterSchema';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { TherapistScalarRelationFilterSchema } from './TherapistScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { MeetingDurationNullableScalarRelationFilterSchema } from './MeetingDurationNullableScalarRelationFilterSchema';
import { MeetingDurationWhereInputSchema } from './MeetingDurationWhereInputSchema';
import { ReviewListRelationFilterSchema } from './ReviewListRelationFilterSchema';

export const MeetingWhereUniqueInputSchema: z.ZodType<Prisma.MeetingWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => MeetingWhereInputSchema),z.lazy(() => MeetingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingWhereInputSchema),z.lazy(() => MeetingWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  startTime: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  endTime: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  status: z.union([ z.lazy(() => EnumMeetingStatusFilterSchema),z.lazy(() => MeetingStatusSchema) ]).optional(),
  meetingType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  meetingUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  durationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
  therapist: z.union([ z.lazy(() => TherapistScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
  durationConfig: z.union([ z.lazy(() => MeetingDurationNullableScalarRelationFilterSchema),z.lazy(() => MeetingDurationWhereInputSchema) ]).optional().nullable(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional()
}).strict());

export default MeetingWhereUniqueInputSchema;
