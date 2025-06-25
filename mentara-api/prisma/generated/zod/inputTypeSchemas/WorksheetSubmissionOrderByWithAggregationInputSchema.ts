import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { WorksheetSubmissionCountOrderByAggregateInputSchema } from './WorksheetSubmissionCountOrderByAggregateInputSchema';
import { WorksheetSubmissionMaxOrderByAggregateInputSchema } from './WorksheetSubmissionMaxOrderByAggregateInputSchema';
import { WorksheetSubmissionMinOrderByAggregateInputSchema } from './WorksheetSubmissionMinOrderByAggregateInputSchema';

export const WorksheetSubmissionOrderByWithAggregationInputSchema: z.ZodType<Prisma.WorksheetSubmissionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  worksheetId: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => WorksheetSubmissionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => WorksheetSubmissionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => WorksheetSubmissionMinOrderByAggregateInputSchema).optional()
}).strict();

export default WorksheetSubmissionOrderByWithAggregationInputSchema;
