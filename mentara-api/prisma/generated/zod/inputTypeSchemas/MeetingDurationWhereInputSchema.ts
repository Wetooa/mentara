import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { MeetingListRelationFilterSchema } from './MeetingListRelationFilterSchema';

export const MeetingDurationWhereInputSchema: z.ZodType<Prisma.MeetingDurationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MeetingDurationWhereInputSchema),z.lazy(() => MeetingDurationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MeetingDurationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MeetingDurationWhereInputSchema),z.lazy(() => MeetingDurationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  sortOrder: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  meetings: z.lazy(() => MeetingListRelationFilterSchema).optional()
}).strict();

export default MeetingDurationWhereInputSchema;
