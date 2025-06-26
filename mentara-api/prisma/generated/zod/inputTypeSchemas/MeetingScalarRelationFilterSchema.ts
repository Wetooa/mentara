import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';

export const MeetingScalarRelationFilterSchema: z.ZodType<Prisma.MeetingScalarRelationFilter> = z.object({
  is: z.lazy(() => MeetingWhereInputSchema).optional(),
  isNot: z.lazy(() => MeetingWhereInputSchema).optional()
}).strict();

export default MeetingScalarRelationFilterSchema;
