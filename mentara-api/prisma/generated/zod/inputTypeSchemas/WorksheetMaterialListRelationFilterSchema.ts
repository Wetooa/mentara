import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialWhereInputSchema } from './WorksheetMaterialWhereInputSchema';

export const WorksheetMaterialListRelationFilterSchema: z.ZodType<Prisma.WorksheetMaterialListRelationFilter> = z.object({
  every: z.lazy(() => WorksheetMaterialWhereInputSchema).optional(),
  some: z.lazy(() => WorksheetMaterialWhereInputSchema).optional(),
  none: z.lazy(() => WorksheetMaterialWhereInputSchema).optional()
}).strict();

export default WorksheetMaterialListRelationFilterSchema;
