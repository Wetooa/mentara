import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';

export const ModeratorScalarRelationFilterSchema: z.ZodType<Prisma.ModeratorScalarRelationFilter> = z.object({
  is: z.lazy(() => ModeratorWhereInputSchema).optional(),
  isNot: z.lazy(() => ModeratorWhereInputSchema).optional()
}).strict();

export default ModeratorScalarRelationFilterSchema;
