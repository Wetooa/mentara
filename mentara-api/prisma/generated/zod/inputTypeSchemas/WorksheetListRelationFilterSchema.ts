import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';

export const WorksheetListRelationFilterSchema: z.ZodType<Prisma.WorksheetListRelationFilter> = z.object({
  every: z.lazy(() => WorksheetWhereInputSchema).optional(),
  some: z.lazy(() => WorksheetWhereInputSchema).optional(),
  none: z.lazy(() => WorksheetWhereInputSchema).optional()
}).strict();

export default WorksheetListRelationFilterSchema;
