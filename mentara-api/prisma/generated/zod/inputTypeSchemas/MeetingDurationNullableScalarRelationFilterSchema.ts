import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingDurationWhereInputSchema } from './MeetingDurationWhereInputSchema';

export const MeetingDurationNullableScalarRelationFilterSchema: z.ZodType<Prisma.MeetingDurationNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => MeetingDurationWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => MeetingDurationWhereInputSchema).optional().nullable()
}).strict();

export default MeetingDurationNullableScalarRelationFilterSchema;
