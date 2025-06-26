import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';

export const MeetingNullableScalarRelationFilterSchema: z.ZodType<Prisma.MeetingNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => MeetingWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => MeetingWhereInputSchema).optional().nullable()
}).strict();

export default MeetingNullableScalarRelationFilterSchema;
