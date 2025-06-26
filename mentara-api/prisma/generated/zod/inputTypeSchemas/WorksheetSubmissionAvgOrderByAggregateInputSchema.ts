import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorksheetSubmissionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.WorksheetSubmissionAvgOrderByAggregateInput> = z.object({
  fileSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorksheetSubmissionAvgOrderByAggregateInputSchema;
