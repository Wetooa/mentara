import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorksheetMaterialCountOrderByAggregateInputSchema } from './WorksheetMaterialCountOrderByAggregateInputSchema';
import { WorksheetMaterialMaxOrderByAggregateInputSchema } from './WorksheetMaterialMaxOrderByAggregateInputSchema';
import { WorksheetMaterialMinOrderByAggregateInputSchema } from './WorksheetMaterialMinOrderByAggregateInputSchema';

export const WorksheetMaterialOrderByWithAggregationInputSchema: z.ZodType<Prisma.WorksheetMaterialOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  worksheetId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => WorksheetMaterialCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => WorksheetMaterialMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => WorksheetMaterialMinOrderByAggregateInputSchema).optional()
}).strict();

export default WorksheetMaterialOrderByWithAggregationInputSchema;
