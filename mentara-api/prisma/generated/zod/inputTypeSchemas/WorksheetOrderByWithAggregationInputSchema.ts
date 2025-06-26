import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorksheetCountOrderByAggregateInputSchema } from './WorksheetCountOrderByAggregateInputSchema';
import { WorksheetMaxOrderByAggregateInputSchema } from './WorksheetMaxOrderByAggregateInputSchema';
import { WorksheetMinOrderByAggregateInputSchema } from './WorksheetMinOrderByAggregateInputSchema';

export const WorksheetOrderByWithAggregationInputSchema: z.ZodType<Prisma.WorksheetOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  instructions: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  dueDate: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  isCompleted: z.lazy(() => SortOrderSchema).optional(),
  submittedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  feedback: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => WorksheetCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => WorksheetMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => WorksheetMinOrderByAggregateInputSchema).optional()
}).strict();

export default WorksheetOrderByWithAggregationInputSchema;
