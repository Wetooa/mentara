import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';

export const MeetingListRelationFilterSchema: z.ZodType<Prisma.MeetingListRelationFilter> = z.object({
  every: z.lazy(() => MeetingWhereInputSchema).optional(),
  some: z.lazy(() => MeetingWhereInputSchema).optional(),
  none: z.lazy(() => MeetingWhereInputSchema).optional()
}).strict();

export default MeetingListRelationFilterSchema;
