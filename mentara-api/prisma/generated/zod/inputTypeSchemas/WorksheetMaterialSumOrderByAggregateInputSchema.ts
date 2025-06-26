import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorksheetMaterialSumOrderByAggregateInputSchema: z.ZodType<Prisma.WorksheetMaterialSumOrderByAggregateInput> = z.object({
  fileSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorksheetMaterialSumOrderByAggregateInputSchema;
