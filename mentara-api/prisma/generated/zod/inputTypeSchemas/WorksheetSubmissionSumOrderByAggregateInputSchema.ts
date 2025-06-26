import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorksheetSubmissionSumOrderByAggregateInputSchema: z.ZodType<Prisma.WorksheetSubmissionSumOrderByAggregateInput> = z.object({
  fileSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorksheetSubmissionSumOrderByAggregateInputSchema;
