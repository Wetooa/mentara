import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';

export const WorksheetScalarRelationFilterSchema: z.ZodType<Prisma.WorksheetScalarRelationFilter> = z.object({
  is: z.lazy(() => WorksheetWhereInputSchema).optional(),
  isNot: z.lazy(() => WorksheetWhereInputSchema).optional()
}).strict();

export default WorksheetScalarRelationFilterSchema;
