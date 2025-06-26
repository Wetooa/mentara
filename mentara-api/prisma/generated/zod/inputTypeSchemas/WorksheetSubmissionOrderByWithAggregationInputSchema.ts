import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorksheetSubmissionCountOrderByAggregateInputSchema } from './WorksheetSubmissionCountOrderByAggregateInputSchema';
import { WorksheetSubmissionAvgOrderByAggregateInputSchema } from './WorksheetSubmissionAvgOrderByAggregateInputSchema';
import { WorksheetSubmissionMaxOrderByAggregateInputSchema } from './WorksheetSubmissionMaxOrderByAggregateInputSchema';
import { WorksheetSubmissionMinOrderByAggregateInputSchema } from './WorksheetSubmissionMinOrderByAggregateInputSchema';
import { WorksheetSubmissionSumOrderByAggregateInputSchema } from './WorksheetSubmissionSumOrderByAggregateInputSchema';

export const WorksheetSubmissionOrderByWithAggregationInputSchema: z.ZodType<Prisma.WorksheetSubmissionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  worksheetId: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  fileType: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => WorksheetSubmissionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => WorksheetSubmissionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => WorksheetSubmissionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => WorksheetSubmissionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => WorksheetSubmissionSumOrderByAggregateInputSchema).optional()
}).strict();

export default WorksheetSubmissionOrderByWithAggregationInputSchema;
