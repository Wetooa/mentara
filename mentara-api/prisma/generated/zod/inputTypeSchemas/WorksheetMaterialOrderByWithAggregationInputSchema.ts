import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorksheetMaterialCountOrderByAggregateInputSchema } from './WorksheetMaterialCountOrderByAggregateInputSchema';
import { WorksheetMaterialAvgOrderByAggregateInputSchema } from './WorksheetMaterialAvgOrderByAggregateInputSchema';
import { WorksheetMaterialMaxOrderByAggregateInputSchema } from './WorksheetMaterialMaxOrderByAggregateInputSchema';
import { WorksheetMaterialMinOrderByAggregateInputSchema } from './WorksheetMaterialMinOrderByAggregateInputSchema';
import { WorksheetMaterialSumOrderByAggregateInputSchema } from './WorksheetMaterialSumOrderByAggregateInputSchema';

export const WorksheetMaterialOrderByWithAggregationInputSchema: z.ZodType<Prisma.WorksheetMaterialOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  worksheetId: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  fileType: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => WorksheetMaterialCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => WorksheetMaterialAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => WorksheetMaterialMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => WorksheetMaterialMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => WorksheetMaterialSumOrderByAggregateInputSchema).optional()
}).strict();

export default WorksheetMaterialOrderByWithAggregationInputSchema;
