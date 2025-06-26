import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';

export const ModeratorNullableScalarRelationFilterSchema: z.ZodType<Prisma.ModeratorNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => ModeratorWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ModeratorWhereInputSchema).optional().nullable()
}).strict();

export default ModeratorNullableScalarRelationFilterSchema;
