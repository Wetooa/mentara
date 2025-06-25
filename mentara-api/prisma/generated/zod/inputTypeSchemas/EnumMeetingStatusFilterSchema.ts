import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { NestedEnumMeetingStatusFilterSchema } from './NestedEnumMeetingStatusFilterSchema';

export const EnumMeetingStatusFilterSchema: z.ZodType<Prisma.EnumMeetingStatusFilter> = z.object({
  equals: z.lazy(() => MeetingStatusSchema).optional(),
  in: z.lazy(() => MeetingStatusSchema).array().optional(),
  notIn: z.lazy(() => MeetingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => MeetingStatusSchema),z.lazy(() => NestedEnumMeetingStatusFilterSchema) ]).optional(),
}).strict();

export default EnumMeetingStatusFilterSchema;
