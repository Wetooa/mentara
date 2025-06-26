import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorksheetMaterialAvgOrderByAggregateInputSchema: z.ZodType<Prisma.WorksheetMaterialAvgOrderByAggregateInput> = z.object({
  fileSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorksheetMaterialAvgOrderByAggregateInputSchema;
