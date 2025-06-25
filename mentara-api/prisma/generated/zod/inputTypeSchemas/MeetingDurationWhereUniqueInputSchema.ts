import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingDurationWhereInputSchema } from './MeetingDurationWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { MeetingListRelationFilterSchema } from './MeetingListRelationFilterSchema';

export const MeetingDurationWhereUniqueInputSchema: z.ZodType<Prisma.MeetingDurationWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    duration: z.number().int()
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    duration: z.number().int(),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  duration: z.number().int().optional(),
  AND: z.union([ z.lazy(() => MeetingDurationWhereInputSchema),z.lazy(() => MeetingDurationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingDurationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingDurationWhereInputSchema),z.lazy(() => MeetingDurationWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  sortOrder: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  meetings: z.lazy(() => MeetingListRelationFilterSchema).optional()
}).strict());

export default MeetingDurationWhereUniqueInputSchema;
