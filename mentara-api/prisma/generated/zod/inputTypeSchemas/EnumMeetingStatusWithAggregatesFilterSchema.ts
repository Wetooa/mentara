import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { NestedEnumMeetingStatusWithAggregatesFilterSchema } from './NestedEnumMeetingStatusWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumMeetingStatusFilterSchema } from './NestedEnumMeetingStatusFilterSchema';

export const EnumMeetingStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumMeetingStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => MeetingStatusSchema).optional(),
  in: z.lazy(() => MeetingStatusSchema).array().optional(),
  notIn: z.lazy(() => MeetingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => MeetingStatusSchema),z.lazy(() => NestedEnumMeetingStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumMeetingStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumMeetingStatusFilterSchema).optional()
}).strict();

export default EnumMeetingStatusWithAggregatesFilterSchema;
